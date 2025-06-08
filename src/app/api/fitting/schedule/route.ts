// app/api/fitting/schedule/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST: Create a fitting schedule
export async function POST(request: NextRequest) {
  try {
    const { 
      userId,
      fittingSlotId,
      duration = 60,
      note,
      phoneNumber,
      productId,
      variantId, // now single value, not array
    } = await request.json();

    if (!userId || !fittingSlotId) {
      return NextResponse.json(
        { error: 'User ID and Fitting slot ID are required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const fittingSlot = await prisma.fittingSlot.findUnique({
      where: { id: parseInt(fittingSlotId) },
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

    // Optional phone update
    if (phoneNumber && !user.phone_numbers) {
      await prisma.user.update({
        where: { id: user.id },
        data: { phone_numbers: phoneNumber },
      });
    }

    // Create fitting schedule
    const fittingSchedule = await prisma.fittingSchedule.create({
      data: {
        userId: user.id,
        fittingSlotId: parseInt(fittingSlotId),
        duration,
        note,
        status: fittingSlot.isAutoConfirm ? 'CONFIRMED' : 'PENDING',
      },
    });

    // Mark slot as booked
    await prisma.fittingSlot.update({
      where: { id: parseInt(fittingSlotId) },
      data: { isBooked: true },
    });

    // Link selected product
    if (productId) {
      await prisma.fittingProduct.create({
        data: {
          fittingId: fittingSchedule.id,
          productId: parseInt(productId),
        },
      });
    }

    // Attach variant info to note (as you don't have FittingVariant model)
    if (variantId) {
      const variant = await prisma.variantProducts.findUnique({
        where: { id: parseInt(variantId) },
      });

      if (variant) {
        const variantInfo = `${variant.size}-${variant.color} (${variant.sku})`;
        const updatedNote = note
          ? `${note}\nVariant: ${variantInfo}`
          : `Variant: ${variantInfo}`;

        await prisma.fittingSchedule.update({
          where: { id: fittingSchedule.id },
          data: { note: updatedNote },
        });
      }
    }

    // Return detailed schedule
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
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
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
