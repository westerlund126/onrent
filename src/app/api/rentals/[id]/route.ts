// app/api/rentals/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from 'lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { TrackingStatus } from '@prisma/client';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await Promise.resolve(context.params);
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

    const rental = await prisma.rental.findFirst({
      where: {
        id: rentalId,
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
      return NextResponse.json({ error: 'Rental not found' }, { status: 404 });
    }

    return NextResponse.json({ data: rental });
  } catch (error) {
    console.error('Get rental error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await Promise.resolve(context.params);
    const rentalId = parseInt(params.id);

    if (isNaN(rentalId)) {
      return NextResponse.json({ error: 'Invalid rental ID' }, { status: 400 });
    }

    const body = await request.json();
    const { status, startDate, endDate, additionalInfo, variantIds } = body;

    const owner = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true },
    });

    if (!owner) {
      return NextResponse.json({ error: 'Owner not found' }, { status: 404 });
    }

    const existingRental = await prisma.rental.findFirst({
      where: {
        id: rentalId,
        ownerId: owner.id,
      },
      include: {
        rentalItems: {
          include: {
            variantProduct: true,
          },
        },
      },
    });

    if (!existingRental) {
      return NextResponse.json({ error: 'Rental not found' }, { status: 404 });
    }

    const updatedRental = await prisma.$transaction(async (tx) => {
      const updateData: any = {};

      // Update basic fields
      if (status !== undefined) updateData.status = status;
      if (additionalInfo !== undefined)
        updateData.additionalInfo = additionalInfo;

      if (startDate || endDate) {
        const newStartDate = startDate
          ? new Date(startDate)
          : existingRental.startDate;
        const newEndDate = endDate ? new Date(endDate) : existingRental.endDate;

        if (newEndDate <= newStartDate) {
          throw new Error('End date must be after start date');
        }

        updateData.startDate = newStartDate;
        updateData.endDate = newEndDate;
      }

      if (variantIds && Array.isArray(variantIds)) {
        const currentVariantIds = existingRental.rentalItems.map(
          (item) => item.variantProductId,
        );
        const newVariantIds = variantIds.map((id) => parseInt(id));

        const currentSorted = [...currentVariantIds].sort();
        const newSorted = [...newVariantIds].sort();
        const variantsChanged =
          JSON.stringify(currentSorted) !== JSON.stringify(newSorted);

        if (variantsChanged) {
          const variantData = await Promise.all(
            newVariantIds.map(async (variantId) => {
              const variant = await tx.variantProducts.findUnique({
                where: { id: variantId },
                include: { products: true },
              });

              if (!variant || !variant.isAvailable) {
                throw new Error(`Variant ${variantId} is not available`);
              }

              const conflictWhere: any = {
                variantProductId: variantId,
                rental: {
                  id: { not: rentalId },
                  OR: [
                    {
                      startDate: {
                        lte: updateData.startDate || existingRental.startDate,
                      },
                      endDate: {
                        gte: updateData.startDate || existingRental.startDate,
                      },
                    },
                    {
                      startDate: {
                        lte: updateData.endDate || existingRental.endDate,
                      },
                      endDate: {
                        gte: updateData.endDate || existingRental.endDate,
                      },
                    },
                    {
                      startDate: {
                        gte: updateData.startDate || existingRental.startDate,
                      },
                      endDate: {
                        lte: updateData.endDate || existingRental.endDate,
                      },
                    },
                  ],
                  status: { not: 'SELESAI' },
                },
              };

              const conflict = await tx.rentalItem.findFirst({
                where: conflictWhere,
              });

              if (conflict) {
                throw new Error(
                  `Variant ${variant.sku} is already rented for the selected dates`,
                );
              }

              return variant;
            }),
          );

          const ownerIds = [
            ...new Set(variantData.map((v) => v.products.ownerId)),
          ];
          if (ownerIds.length > 1 || ownerIds[0] !== owner.id) {
            throw new Error('All variants must belong to the same owner');
          }

          const variantsToRemove = currentVariantIds.filter(
            (id) => !newVariantIds.includes(id),
          );
          const variantsToAdd = newVariantIds.filter(
            (id) => !currentVariantIds.includes(id),
          );

          if (variantsToRemove.length > 0) {
            await tx.rentalItem.deleteMany({
              where: {
                rentalId: rentalId,
                variantProductId: { in: variantsToRemove },
              },
            });

            await tx.variantProducts.updateMany({
              where: { id: { in: variantsToRemove } },
              data: { isRented: false, isAvailable: true },
            });
          }

          if (variantsToAdd.length > 0) {
            await tx.rentalItem.createMany({
              data: variantsToAdd.map((variantId) => ({
                rentalId: rentalId,
                variantProductId: variantId,
              })),
            });

            await tx.variantProducts.updateMany({
              where: { id: { in: variantsToAdd } },
              data: { isRented: true, isAvailable: false },
            });
          }
        }
      }

      const rental = await tx.rental.update({
        where: { id: rentalId },
        data: updateData,
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
      });

      if (status && status !== existingRental.status) {
        const trackingStatus = getTrackingStatus(status);
        if (trackingStatus) {
          await tx.tracking.create({
            data: {
              rentalId: rentalId,
              status: trackingStatus as TrackingStatus,
            },
          });
        }
      }

      return rental;
    },
    { maxWait: 10000, timeout: 10000 },
  );

    return NextResponse.json({
      success: true,
      message: 'Rental updated successfully',
      data: updatedRental,
    });
  } catch (error: any) {
    console.error('Rental update error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await Promise.resolve(context.params);
    const rentalId = parseInt(params.id);

    if (isNaN(rentalId)) {
      return NextResponse.json({ error: 'Invalid rental ID' }, { status: 400 });
    }

    const owner = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!owner) {
      return NextResponse.json({ error: 'Owner not found' }, { status: 404 });
    }

    const rental = await prisma.rental.findFirst({
      where: {
        id: rentalId,
        ownerId: owner.id,
      },
    });

    if (!rental) {
      return NextResponse.json({ error: 'Rental not found' }, { status: 404 });
    }

    await prisma.rentalItem.deleteMany({
      where: { rentalId },
    });

    await prisma.tracking.deleteMany({
      where: { rentalId },
    });

    // Then delete the rental
    await prisma.rental.delete({
      where: { id: rentalId },
    });

    return NextResponse.json({ message: 'Rental deleted successfully' });
  } catch (error) {
    console.error('[DELETE RENTAL]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

function getTrackingStatus(rentalStatus: string): string | null {
  const statusMap: Record<string, string> = {
    BELUM_LUNAS: 'RENTAL_ONGOING',
    LUNAS: 'RENTAL_ONGOING',
    TERLAMBAT: 'RENTAL_OVERDUE',
    SELESAI: 'RENTAL_COMPLETED',
  };

  return statusMap[rentalStatus] || null;
}
