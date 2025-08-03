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
      select: { id: true },
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

    if (
      latestTracking.status === 'RETURNED' ||
      latestTracking.status === 'COMPLETED'
    ) {
      return NextResponse.json(
        { error: 'This rental has already been returned.' },
        { status: 400 },
      );
    }

    if (
      latestTracking.status !== 'RENTAL_ONGOING' &&
      latestTracking.status !== 'RETURN_PENDING'
    ) {
      return NextResponse.json(
        {
          error:
            'Rental cannot be returned at this time. Current status does not allow returns.',
        },
        { status: 400 },
      );
    }

    const updatedRental = await prisma.$transaction(
      async (tx) => {
        await tx.tracking.create({
          data: {
            rentalId: rentalId,
            status: 'RETURNED',
          },
        });

        return await tx.rental.findFirst({
          where: { id: rentalId },
          include: {
            user: { // The customer
              select: {
                first_name: true,
                last_name: true,
              },
            },
            owner: { // The owner
              select: {
                clerkUserId: true,
              },
            },
            rentalItems: {
              include: {
                variantProduct: {
                  select: {
                    products: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });
      },
      {
        maxWait: 5000, // 5 seconds
        timeout: 10000, // 10 seconds
      }
    );

    if (!updatedRental) {
      throw new Error("Failed to update and retrieve rental details.");
    }

    if (updatedRental.owner.clerkUserId) {
      setImmediate(async () => {
        try {
          const oneSignalService = new OneSignalService();
          const customerName = `${updatedRental.user.first_name} ${updatedRental.user.last_name || ''}`.trim();
          const productNames = updatedRental.rentalItems.map(item => item.variantProduct.products.name);
          
          await oneSignalService.notifyOwnerReturnRequest({
            ownerExternalId: updatedRental.owner.clerkUserId!,
            customerName: customerName,
            rentalCode: updatedRental.rentalCode,
            productNames: productNames,
            rentalId: updatedRental.id,
          });
          
          console.log(`[Notification] Return request notification sent for rental ${updatedRental.id}`);
        } catch (notificationError) {
          console.error("[Notification] Failed to send return request notification:", notificationError);
        }
      });
    }

    return NextResponse.json({
      success: true,
      message:
        'Return initiated successfully. Please wait for owner confirmation.',
      data: updatedRental,
    });
  } catch (error: any) {
    console.error('Customer return error:', error);
    
    if (error.code === 'P2034') {
      return NextResponse.json(
        { error: 'Transaction timeout. Please try again.' },
        { status: 408 },
      );
    }
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Return request already exists.' },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 },
    );
  }
}