// app/api/rentals/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from 'lib/prisma';
import { generateRentalCode } from 'utils/rental-code';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const owner = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true },
    });

    if (!owner) {
      return NextResponse.json({ error: 'Owner not found' }, { status: 404 });
    }

    const [rentals, totalCount] = await Promise.all([
      prisma.rental.findMany({
        where: {
          ownerId: owner.id,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              first_name: true,
              last_name: true,
            },
          },
          owner: {
            select: {
              id: true,
              username: true,
              businessName: true,
              phone_numbers: true,
            },
          },
          rentalItems: {
            include: {
              variantProduct: {
                select: {
                  id: true,
                  sku: true,
                  size: true,
                  color: true,
                  price: true,
                  products: {
                    select: {
                      id: true,
                      name: true,
                      category: true,
                    },
                  },
                  isAvailable: true,
                  isRented: true,
                },
              },
            },
          },
          Tracking: {
            orderBy: { updatedAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.rental.count({
        where: {
          ownerId: owner.id,
        },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: rentals,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Get rentals error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerId,
      variantIds,
      startDate,
      endDate,
      status,
      additionalInfo,
    } = body;

    if (
      !customerId ||
      !Array.isArray(variantIds) ||
      variantIds.length === 0 ||
      !startDate ||
      !endDate
    ) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: customerId, variantIds, startDate, endDate',
        },
        { status: 400 },
      );
    }

    const customerIdNum = parseInt(customerId);
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (
      isNaN(customerIdNum) ||
      isNaN(start.getTime()) ||
      isNaN(end.getTime()) ||
      end <= start
    ) {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 },
      );
    }

    const customer = await prisma.user.findUnique({
      where: { id: customerIdNum },
      select: { id: true },
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 },
      );
    }

    const rental = await prisma.$transaction(
      async (tx) => {
        const variantData = await Promise.all(
          variantIds.map(async (id) => {
            const variantId = parseInt(id);
            const variant = await tx.variantProducts.findUnique({
              where: { id: variantId },
              include: { products: true },
            });

            if (!variant || !variant.isAvailable || variant.isRented) {
              throw new Error(`Variant ${variantId} is not available`);
            }

            // Check for date conflicts
            const conflict = await tx.rentalItem.findFirst({
              where: {
                variantProductId: variantId,
                rental: {
                  OR: [
                    { startDate: { lte: start }, endDate: { gte: start } },
                    { startDate: { lte: end }, endDate: { gte: end } },
                    { startDate: { gte: start }, endDate: { lte: end } },
                  ],
                  status: { not: 'SELESAI' },
                },
              },
            });

            if (conflict) {
              throw new Error(
                `Variant ${variantId} is already rented for selected dates`,
              );
            }

            return variant;
          }),
        );

        const ownerIds = [
          ...new Set(variantData.map((v) => v.products.ownerId)),
        ];
        if (ownerIds.length > 1) {
          throw new Error('All variants must belong to the same owner');
        }

        const rentalCode = await generateRentalCode();

        const newRental = await tx.rental.create({
          data: {
            userId: customerIdNum,
            ownerId: ownerIds[0],
            rentalCode,
            startDate: start,
            endDate: end,
            status: status || 'BELUM_LUNAS',
            additionalInfo: additionalInfo || '',
            rentalItems: {
              create: variantData.map((v) => ({ variantProductId: v.id })),
            },
          },
          include: {
            user: { select: { id: true, username: true } },
            owner: { select: { id: true, username: true } },
            rentalItems: {
              include: {
                variantProduct: {
                  include: {
                    products: true,
                  },
                },
              },
            },
          },
        });

        for (const variant of variantData) {
          await tx.variantProducts.update({
            where: { id: variant.id },
            data: { isAvailable: false, isRented: true },
          });
        }

        await tx.tracking.create({
          data: {
            rentalId: newRental.id,
            status: 'RENTAL_ONGOING',
          },
        });

        return newRental;
      },
      { timeout: 15_000 },
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Rental created successfully',
        data: rental,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error('Rental creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 },
    );
  }
}
