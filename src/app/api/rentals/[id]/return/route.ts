// app/api/rentals/[id]/return/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from 'lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { OneSignalService } from 'lib/onesignal';

export async function POST(
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

    const customer = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: { 
        id: true,
        first_name: true,
        last_name: true,
        username: true,
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 },
      );
    }

    const rental = await prisma.rental.findFirst({
      where: {
        id: rentalId,
        userId: customer.id,
      },
      include: {
        owner: {
          select: {
            id: true,
            clerkUserId: true,
            businessName: true,
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
                products: {
                  select: {
                    name: true,
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
      },
    });

    if (!rental) {
      return NextResponse.json(
        { error: 'Rental not found or access denied' },
        { status: 404 },
      );
    }

    const latestTracking = rental.Tracking[0];

    if (!latestTracking) {
      return NextResponse.json(
        { error: 'Rental tracking information not found' },
        { status: 400 },
      );
    }

    // Check if rental has already been returned or completed
    if (
      latestTracking.status === 'RETURNED' ||
      latestTracking.status === 'COMPLETED'
    ) {
      return NextResponse.json(
        { error: 'This rental has already been returned.' },
        { status: 400 },
      );
    }

    // Check if rental can be returned (must be RENTAL_ONGOING)
    if (latestTracking.status !== 'RENTAL_ONGOING') {
      return NextResponse.json(
        {
          error:
            'Rental cannot be returned at this time. Current status does not allow returns.',
        },
        { status: 400 },
      );
    }

    // Update rental status and create tracking
    const updatedRental = await prisma.$transaction(async (tx) => {
      await tx.tracking.create({
        data: {
          rentalId: rentalId,
          status: 'RETURN_PENDING',
        },
      });

      return await tx.rental.findFirst({
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
              clerkUserId: true,
              username: true,
              businessName: true,
              first_name: true,
              last_name: true,
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
                },
              },
            },
          },
          Tracking: {
            orderBy: { updatedAt: 'desc' },
            take: 1,
          },
        },
      });
    });

    // Send notification to owner
    try {
      if (rental.owner?.clerkUserId) {
        const oneSignalService = new OneSignalService();
        
        const customerName = `${customer.first_name} ${customer.last_name || ''}`.trim();
        const productNames = rental.rentalItems.map(
          item => item.variantProduct.products.name
        );

        await oneSignalService.notifyOwnerReturnRequest({
          ownerExternalId: rental.owner.clerkUserId,
          customerName,
          rentalCode: rental.rentalCode,
          productNames,
          rentalId: rental.id,
        });

        console.log(`[OneSignal] Return notification sent to owner ${rental.owner.clerkUserId}`);
      }
    } catch (notificationError) {
      // Log notification error but don't fail the request
      console.error('[OneSignal] Failed to send notification:', notificationError);
    }

    return NextResponse.json({
      success: true,
      message:
        'Return initiated successfully. Please wait for owner confirmation.',
      data: updatedRental,
    });
  } catch (error: any) {
    console.error('Customer return error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 },
    );
  }
}