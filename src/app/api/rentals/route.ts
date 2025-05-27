// app/api/rentals/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from 'lib/prisma';
import { generateRentalCode } from 'utils/rental-code';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const customerUserId = searchParams.get('customerUserId'); // Renamed for clarity

    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const owner = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true },
    });

    if (!owner)
      return NextResponse.json({ error: 'Owner not found' }, { status: 404 });

    const skip = (page - 1) * limit;

    const where: any = {
      ownerId: owner.id,
      products: { ownerId: owner.id },
    };

    if (status) where.status = status;

    // Only add customerUserId filter if it's provided and valid
    if (customerUserId) {
      const parsedCustomerUserId = parseInt(customerUserId);
      if (!isNaN(parsedCustomerUserId)) {
        where.userId = parsedCustomerUserId;
      }
    }

    const [rentals, total] = await Promise.all([
      prisma.rental.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
          products: {
            select: { id: true, name: true, ownerId: true },
          },
          variantProduct: {
            select: {
              id: true,
              sku: true,
              size: true,
              color: true,
              price: true,
            },
          },
          Tracking: {
            orderBy: { updatedAt: 'desc' },
            take: 1,
          },
        },
      }),
      prisma.rental.count({ where }),
    ]);

    return NextResponse.json({
      data: rentals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
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

    const { customerId, variantId, startDate, endDate, status } = body;

    if (!customerId || !variantId || !startDate || !endDate) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: customerId, variantId, startDate, endDate',
        },
        { status: 400 },
      );
    }

    const customerIdNum = parseInt(customerId);
    const variantIdNum = parseInt(variantId);

    if (isNaN(customerIdNum) || isNaN(variantIdNum)) {
      return NextResponse.json(
        { error: 'Invalid customerId or variantId format' },
        { status: 400 },
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 },
      );
    }

    if (end <= start) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 },
      );
    }

    const customer = await prisma.user.findUnique({
      where: { id: customerIdNum },
      select: { id: true, username: true },
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 },
      );
    }

    const variant = await prisma.variantProducts.findUnique({
      where: { id: variantIdNum },
      include: {
        products: {
          select: { id: true, name: true, ownerId: true },
        },
      },
    });

    if (!variant) {
      return NextResponse.json(
        { error: 'Product variant not found' },
        { status: 404 },
      );
    }

    if (!variant.isAvailable) {
      return NextResponse.json(
        { error: 'Product variant is not available' },
        { status: 400 },
      );
    }

    if (variant.isRented) {
      return NextResponse.json(
        { error: 'Product variant is currently rented' },
        { status: 400 },
      );
    }

    const conflictingRental = await prisma.rental.findFirst({
      where: {
        variantProductId: variantIdNum,
        OR: [
          {
            AND: [{ startDate: { lte: start } }, { endDate: { gte: start } }],
          },
          {
            AND: [{ startDate: { lte: end } }, { endDate: { gte: end } }],
          },
          {
            AND: [{ startDate: { gte: start } }, { endDate: { lte: end } }],
          },
        ],
        status: {
          not: 'SELESAI',
        },
      },
    });

    if (conflictingRental) {
      return NextResponse.json(
        { error: 'Product variant is already rented for the selected dates' },
        { status: 400 },
      );
    }

    const rentalCode = await generateRentalCode();

    const rental = await prisma.$transaction(async (tx) => {
      const newRental = await tx.rental.create({
        data: {
          userId: customerIdNum,
          ownerId: variant.products.ownerId,
          rentalCode,
          startDate: start,
          endDate: end,
          status: status || 'BELUM_LUNAS',
          productsId: variant.products.id,
          variantProductId: variantIdNum,
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
          products: { select: { id: true, name: true } },
          variantProduct: {
            select: {
              id: true,
              sku: true,
              size: true,
              color: true,
              price: true,
            },
          },
        },
      });

      await tx.variantProducts.update({
        where: { id: variantIdNum },
        data: { isRented: true },
      });

      await tx.tracking.create({
        data: {
          rentalId: newRental.id,
          status: 'RENTAL_ONGOING',
        },
      });

      return newRental;
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Rental created successfully',
        data: rental,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Rental creation error:', error);

    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Rental code already exists. Please try again.' },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
