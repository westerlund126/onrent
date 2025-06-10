import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

// POST: Create a fitting schedule
export async function POST(request: NextRequest) {
  try {
  const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      fittingSlotId,
      duration = 60,
      note,
      phoneNumber,
      productId,
      variantId,
    } = await request.json();

    const parsedSlotId = parseInt(fittingSlotId);
    if (isNaN(parsedSlotId)) {
      return NextResponse.json({ error: 'Invalid Fitting Slot ID' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId},
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const fittingSlot = await prisma.fittingSlot.findUnique({
      where: { id: parsedSlotId },
    });

    if (!fittingSlot) {
      return NextResponse.json({ error: 'Fitting slot not found' }, { status: 404 });
    }

    if (fittingSlot.isBooked) {
      return NextResponse.json({ error: 'Fitting slot is already booked' }, { status: 400 });
    }

    // Optional phone number update
    if (phoneNumber && !user.phone_numbers) {
      await prisma.user.update({
        where: { id: user.id },
        data: { phone_numbers: phoneNumber },
      });
    }

    // Handle optional variant info
    let finalNote = note || '';
    if (variantId) {
      const parsedVariantId = parseInt(variantId);
      if (!isNaN(parsedVariantId)) {
        const variant = await prisma.variantProducts.findUnique({
          where: { id: parsedVariantId },
        });

        if (variant) {
          const variantInfo = `Variant: ${variant.size}-${variant.color} (${variant.sku})`;
          finalNote = finalNote ? `${finalNote}\n${variantInfo}` : variantInfo;
        }
      }
    }

    // Create the fitting schedule
    const fittingSchedule = await prisma.fittingSchedule.create({
      data: {
        userId: user.id,
        fittingSlotId: parsedSlotId,
        duration,
        note: finalNote,
        status: fittingSlot.isAutoConfirm ? 'CONFIRMED' : 'PENDING',
      },
    });

    // Mark slot as booked
    await prisma.fittingSlot.update({
      where: { id: parsedSlotId },
      data: { isBooked: true },
    });

    // Link product if available
    if (productId) {
      const parsedProductId = parseInt(productId);
      if (!isNaN(parsedProductId)) {
        await prisma.fittingProduct.create({
          data: {
            fittingId: fittingSchedule.id,
            productId: parsedProductId,
          },
        });
      }
    }

    // Return full schedule detail
    const completeSchedule = await prisma.fittingSchedule.findUnique({
      where: { id: fittingSchedule.id },
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
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                category: true,
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
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// GET: Get user's fitting schedules
export async function GET(request: NextRequest) {
  try {
  const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId},
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const schedules = await prisma.fittingSchedule.findMany({
      where: { userId: user.id },
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
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                category: true,
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
      { status: 500 }
    );
  }
}
