// app/api/fittings/schedules/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from 'lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { FittingStatus, UserRole } from '@prisma/client';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const status = searchParams.get('status');
  const ownerId = searchParams.get('ownerId');

  try {
    const schedules = await prisma.fittingSchedule.findMany({
      where: {
        ...(userId ? { userId: parseInt(userId) } : {}),
        ...(status ? { status: { equals: status as FittingStatus } } : {}),
        ...(ownerId ? { fittingSlot: { ownerId: parseInt(ownerId) } } : {}),
      },
      include: {
        fittingSlot: true,
        user: true,
        FittingProduct: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(schedules);
  } catch (error) {
    console.error('Error fetching fitting schedules:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { sessionClaims } = await auth();
    if (!sessionClaims?.userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Find user in database using Clerk user ID
    const user = await prisma.user.findUnique({
      where: { clerkUserId: sessionClaims.userId as string },
    });

    if (!user || user.role !== UserRole.CUSTOMER) {
      return NextResponse.json(
        { message: 'Only customers can book fittings' },
        { status: 403 },
      );
    }

    const { slotId, productIds } = await req.json();

    // Validate input
    if (!slotId) {
      return NextResponse.json(
        { message: 'Slot ID is required' },
        { status: 400 },
      );
    }

    const slot = await prisma.fittingSlot.findUnique({
      where: { id: parseInt(slotId) },
    });

    if (!slot) {
      return NextResponse.json({ message: 'Slot not found' }, { status: 404 });
    }

    if (slot.isBooked) {
      return NextResponse.json(
        { message: 'Slot already booked' },
        { status: 400 },
      );
    }

    const schedule = await prisma.fittingSchedule.create({
      data: {
        userId: user.id, 
        fittingSlotId: parseInt(slotId),
        status: slot.isAutoConfirm ? 'CONFIRMED' : 'PENDING',
        ...(productIds &&
          productIds.length > 0 && {
            FittingProduct: {
              create: productIds.map((productId: number) => ({
                productId,
              })),
            },
          }),
      },
    });

    await prisma.fittingSlot.update({
      where: { id: parseInt(slotId) },
      data: { isBooked: true },
    });

    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    console.error('Error creating fitting schedule:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
