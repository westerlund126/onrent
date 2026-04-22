// app/api/rentals/[id]/confirm-return/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from 'lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const rentalId = parseInt(params.id);

    if (isNaN(rentalId)) {
      return NextResponse.json({ error: 'Invalid rental ID' }, { status: 400 });
    }

    const owner = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true },
    });

    if (!owner) {
      return NextResponse.json({ error: 'Owner not found' }, { status: 404 });
    }

    // Get rental with minimal data for validation
    const rental = await prisma.rental.findFirst({
      where: {
        id: rentalId,
        ownerId: owner.id, 
      },
      select: {
        id: true,
        status: true,
        rentalItems: {
          select: {
            variantProduct: {
              select: {
                id: true,
              },
            },
          },
        },
        Tracking: {
          select: {
            status: true,
          },
          orderBy: { updatedAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!rental) {
      return NextResponse.json(
        { error: 'Rental not found or access denied' },
        { status: 404 },
      );
    }

    const latestTracking = rental.Tracking[0];

    if (!latestTracking || latestTracking.status !== 'RETURNED') {
      return NextResponse.json(
        {
          error:
            'Rental cannot be confirmed at this time. Customer must initiate return first.',
        },
        { status: 400 },
      );
    }

    const variantProductIds = rental.rentalItems.map(
      (item) => item.variantProduct.id,
    );

    // Perform the transaction with increased timeout and smaller operations
    const updatedRental = await prisma.$transaction(
      async (tx) => {
        // Create return record
        await tx.return.create({
          data: {
            rentalId: rentalId,
            returnDate: new Date(),
          },
        });

        // Update rental status
        await tx.rental.update({
          where: { id: rentalId },
          data: { status: 'SELESAI' },
        });

        // Create tracking record
        await tx.tracking.create({
          data: {
            rentalId: rentalId,
            status: 'COMPLETED',
          },
        });

        // Update variant products availability
        await tx.variantProducts.updateMany({
          where: {
            id: { in: variantProductIds },
          },
          data: {
            isRented: false,
            isAvailable: true,
          },
        });

        // Return success without the heavy query
        return { success: true };
      },
      {
        maxWait: 10000, // 10 seconds
        timeout: 15000, // 15 seconds
      }
    );

    // Fetch the updated rental data separately after transaction
    const finalRental = await prisma.rental.findFirst({
      where: { id: rentalId },
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
                isAvailable: true,
                isRented: true,
                products: {
                  select: {
                    id: true,
                    name: true,
                    category: true,
                  },
                },
              },
            },
          },
        },
        Tracking: {
          orderBy: { updatedAt: 'desc' },
          take: 1,
        },
        Return: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message:
        'Return confirmed successfully. Products are now available for rent again.',
      data: finalRental,
    });
  } catch (error: any) {
    console.error('Owner return confirmation error:', error);
    
    // More detailed error handling
    if (error.code === 'P2034') {
      return NextResponse.json(
        { error: 'Transaction timeout. Please try again.' },
        { status: 408 },
      );
    }
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Duplicate entry. Return may have already been processed.' },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 },
    );
  }
}