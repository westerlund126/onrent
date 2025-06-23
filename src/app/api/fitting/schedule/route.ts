//api/fitting/schedule/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const {
      fittingSlotId,
      duration = 60,
      note,
      phoneNumber,
      variantId,
      variantIds = [],
    } = await request.json();

    if (!fittingSlotId) {
      return NextResponse.json(
        { error: 'Fitting slot ID is required' },
        { status: 400 },
      );
    }

    // Build variant IDs array from different possible inputs
    let allVariantIds: number[] = [];

    if (variantIds.length > 0) {
      allVariantIds = [...variantIds];
    }

    if (variantId) {
      allVariantIds.push(variantId);
    }

    const variantIdsNumeric: number[] = Array.from(
      new Set(
        allVariantIds.map((id: any) => parseInt(id)).filter((id) => !isNaN(id)),
      ),
    );

    // First, validate the fitting slot outside the transaction
    const fittingSlot = await prisma.fittingSlot.findUnique({
      where: { id: parseInt(fittingSlotId) },
      include: {
        owner: { select: { id: true } }
      }
    });

    if (!fittingSlot) {
      return NextResponse.json(
        { error: 'Fitting slot not found' },
        { status: 404 }
      );
    }

    if (fittingSlot.isBooked) {
      return NextResponse.json(
        { error: 'Fitting slot is already booked' },
        { status: 400 }
      );
    }

    // Validate variants outside the transaction if provided
    let existingVariants: any[] = [];
    if (variantIdsNumeric.length > 0) {
      existingVariants = await prisma.variantProducts.findMany({
        where: { id: { in: variantIdsNumeric } },
        select: { 
          id: true,
          products: {
            select: { ownerId: true }
          }
        },
      });

      if (existingVariants.length !== variantIdsNumeric.length) {
        const missingIds = variantIdsNumeric.filter(
          (id) => !existingVariants.some((v) => v.id === id),
        );
        return NextResponse.json(
          { error: `Variants not found: ${missingIds.join(', ')} `},
          { status: 400 }
        );
      }
    }

    // Now run the transaction with shorter operations
    const result = await prisma.$transaction(async (tx) => {
      // Double-check the slot is still available
      const currentSlot = await tx.fittingSlot.findUnique({
        where: { id: parseInt(fittingSlotId) },
        select: { isBooked: true }
      });

      if (currentSlot?.isBooked) {
        throw new Error('Fitting slot was just booked by another user');
      }

      // Update user phone number if provided
      if (phoneNumber && phoneNumber !== user.phone_numbers) {
        await tx.user.update({
          where: { id: user.id },
          data: { phone_numbers: phoneNumber },
        });
      }

      // Create fitting schedule
      const fittingSchedule = await tx.fittingSchedule.create({
        data: {
          userId: user.id,
          ownerId: fittingSlot.owner.id,
          fittingSlotId: parseInt(fittingSlotId),
          duration,
          note,
          status: fittingSlot.isAutoConfirm ? 'CONFIRMED' : 'PENDING',
        },
      });

      // Mark slot as booked
      await tx.fittingSlot.update({
        where: { id: parseInt(fittingSlotId) },
        data: { isBooked: true },
      });

      // Create fitting products if variants provided
      if (variantIdsNumeric.length > 0) {
        await tx.fittingProduct.createMany({
          data: variantIdsNumeric.map((variantId: number) => {
            const variant = existingVariants.find(v => v.id === variantId);
            return {
              fittingId: fittingSchedule.id,
              variantProductId: Number(variantId),
              ownerId: variant!.products.ownerId,
            };
          }),
          skipDuplicates: true,
        });
      }

      return fittingSchedule.id;
    }, {
      timeout: 10000, // 10 second timeout
    });

    // Fetch complete schedule with relations
    const completeSchedule = await prisma.fittingSchedule.findUnique({
      where: { id: result },
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            phone_numbers: true,
          },
        },
        fittingSlot: {
          include: {
            owner: {
              select: {
                id: true,
                businessName: true,
                businessAddress: true,
                phone_numbers: true,
                email: true,
                imageUrl: true,
              },
            },
          },
        },
        FittingProduct: {
          include: {
            variantProduct: {
              select: {
                id: true,
                size: true,
                color: true,
                sku: true,
                products: {
                  select: {
                    id: true,
                    name: true,
                    images: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Fitting schedule created successfully',
      schedule: completeSchedule,
    });
  } catch (error: any) {
    console.error('Error creating fitting schedule:', error);
    const status = error.message.includes('not found') ? 404 : 500;
    return NextResponse.json(
      {
        error: 'Error creating fitting schedule',
        details: error.message,
      },
      { status },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId: callerClerkId } = await auth();

    if (!callerClerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const caller = await prisma.user.findUnique({
      where: { clerkUserId: callerClerkId },
      select: { id: true, role: true },
    });

    if (!caller) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const ownerIdParam = searchParams.get('ownerId');

    let whereClause: any = {};

    if (caller.role === 'CUSTOMER') {
      whereClause.userId = caller.id;
    } else if (caller.role === 'OWNER') {
      if (ownerIdParam) {
        const requestedOwnerId = parseInt(ownerIdParam);
        if (requestedOwnerId === caller.id) {
          whereClause.fittingSlot = { ownerId: caller.id };
        } else {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
      } else {
        // Default to caller's own schedules
        whereClause.fittingSlot = { ownerId: caller.id };
      }
    } else if (caller.role === 'ADMIN') {
      if (ownerIdParam) {
        whereClause.fittingSlot = { ownerId: parseInt(ownerIdParam) };
      }
    }

    const schedules = await prisma.fittingSchedule.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            phone_numbers: true,
          },
        },
        fittingSlot: {
          include: {
            owner: {
              select: {
                id: true,
                businessName: true,
                businessAddress: true,
                phone_numbers: true,
                email: true,
                imageUrl: true,
              },
            },
          },
        },
        FittingProduct: {
          include: {
            variantProduct: {
              select: {
                id: true,
                size: true,
                color: true,
                sku: true,
                products: {
                  select: {
                    id: true,
                    name: true,
                    images: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(schedules);
  } catch (error: any) {
    console.error('Error fetching fitting schedules:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 },
    );
  }
}