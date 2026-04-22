// app/api/rentals/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from 'lib/prisma';
import { generateRentalCode } from 'utils/rental-code';
import { auth } from '@clerk/nextjs/server';
import { format } from 'date-fns/format';
import { EmailService } from 'lib/resend';
import { id as localeId } from 'date-fns/locale';

const emailService = new EmailService();

const formatRentalDate = (date: Date) => {
  return format(date, "EEEE, d MMMM yyyy", { locale: localeId });
};

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
    const userType = searchParams.get('userType'); // 'owner' or 'admin'

    const currentUser = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: {
        id: true,
        role: true,
        username: true,
        businessName: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let whereClause = {};

    if (userType === 'admin' && currentUser.role === 'ADMIN') {
      whereClause = {};
    } else if (userType === 'owner' || currentUser.role === 'OWNER') {
      whereClause = {
        ownerId: currentUser.id,
      };
    } else {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 },
      );
    }

    const now = new Date();
    await prisma.$transaction(async (tx) => {
      const overdueRentals = await tx.rental.findMany({
        where: {
          ...whereClause,
          endDate: { lt: now },
          Tracking: {
            some: {
              status: 'RENTAL_ONGOING',
            },
          },
        },
        include: {
          Tracking: {
            orderBy: { updatedAt: 'desc' },
            take: 1,
          },
        },
      });

      for (const rental of overdueRentals) {
        const latestTracking = rental.Tracking[0];
        if (latestTracking && latestTracking.status === 'RENTAL_ONGOING') {
          await tx.tracking.create({
            data: {
              rentalId: rental.id,
              status: 'RETURN_PENDING',
            },
          });
        }
      }
    });

    const [rentals, totalCount] = await Promise.all([
      prisma.rental.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              first_name: true,
              last_name: true,
              phone_numbers: true,
            },
          },
          owner: {
            select: {
              id: true,
              username: true,
              businessName: true,
              phone_numbers: true,
              first_name: true,
              last_name: true,
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
        where: whereClause,
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: rentals,
      pagination: {
        page,
        limit,
        total: totalCount,
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
        { error: 'Missing required fields' },
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
            user: { 
              select: {
                id: true,
                username: true,
                email: true,
                first_name: true,
                last_name: true,
              }
            },
            owner: {
              select: {
                id: true,
                username: true,
                businessName: true,
                first_name: true,
                last_name: true,
              }
            },
            rentalItems: {
              include: {
                variantProduct: {
                  select: {
                    size: true,
                    color: true,
                    products: {
                      select: {
                        name: true
                      }
                    }
                  }
                }
              }
            }
          }
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

    if (rental) {
      try {
        const customerName = `${rental.user.first_name || ''} ${rental.user.last_name || ''}`.trim() || rental.user.username;
        const ownerName = `${rental.owner.first_name || ''} ${rental.owner.last_name || ''}`.trim() || rental.owner.username;
        
        const productDetails = rental.rentalItems.map(item => ({
          name: item.variantProduct.products.name,
          variant: `${item.variantProduct.size} - ${item.variantProduct.color}`
        }));

        await emailService.notifyCustomerNewRental({
          customerEmail: rental.user.email,
          customerName,
          ownerName,
          businessName: rental.owner.businessName || undefined,
          rentalCode: rental.rentalCode,
          startDate: formatRentalDate(rental.startDate),
          endDate: formatRentalDate(rental.endDate),
          productDetails,
          rentalUrl: `${process.env.NEXT_PUBLIC_APP_URL}/rentals/${rental.id}`,
          additionalInfo: rental.additionalInfo || undefined,
        });

      } catch (emailError) {
        console.error('Failed to send new rental notification email:', emailError);
      }
    }

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
