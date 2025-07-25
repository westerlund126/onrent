// app/api/fitting/schedule/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
// import { PrismaClient } from '@prisma/client';
import prisma from 'lib/prisma';
import { auth } from '@clerk/nextjs/server';

// const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const resolvedParams = await params;
    const scheduleId = parseInt(resolvedParams.id);

    const schedule = await prisma.fittingSchedule.findUnique({
      where: { id: scheduleId },
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            username: true,
            email: true,
            phone_numbers: true,
            imageUrl: true,
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
                isAutoConfirm: true,
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
                    category: true,
                    images: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!schedule) {
      return NextResponse.json(
        { error: 'Fitting schedule not found' },
        { status: 404 },
      );
    }

    const canAccess =
      caller.role === 'ADMIN' ||
      schedule.userId === caller.id ||
      (caller.role === 'OWNER' && schedule.fittingSlot.ownerId === caller.id);

    if (!canAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json(schedule);
  } catch (error: any) {
    console.error('Error fetching fitting schedule:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 },
    );
  }
}


export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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
    const resolvedParams = await params;
    const scheduleId = parseInt(resolvedParams.id);
    const updates = await request.json();

    const updatedSchedule = await prisma.$transaction(async (tx) => {
      const schedule = await tx.fittingSchedule.findUnique({
        where: { id: scheduleId },
      });

      if (!schedule) {
        throw new Error('Fitting schedule not found');
      }

      const canUpdate =
        caller.role === 'ADMIN' ||
        schedule.userId === caller.id ||
        (caller.role === 'OWNER' && schedule.ownerId === caller.id);

      if (!canUpdate) {
        throw new Error('Access denied');
      }

      const isCancelingOrRejecting =
        (updates.status === 'CANCELED' || updates.status === 'REJECTED') &&
        schedule.status !== 'CANCELED' &&
        schedule.status !== 'REJECTED';

      if (isCancelingOrRejecting) {
        await tx.fittingSchedule.update({
          where: { id: scheduleId },
          data: {
            status: updates.status,
            isActive: false, 
          },
        });

        await tx.fittingSlot.update({
          where: { id: schedule.fittingSlotId },
          data: { isBooked: false },
        });

        return { message: 'Schedule updated successfully' };
      } else {
        const newSchedule = await tx.fittingSchedule.update({
          where: { id: scheduleId },
          data: {
            ...(updates.status && { status: updates.status }),
            ...(updates.note !== undefined && { note: updates.note }),
          },
          include: {
            user: true,
            fittingSlot: { include: { owner: true } },
            FittingProduct: {
              include: { variantProduct: { include: { products: true } } },
            },
          },
        });
        return newSchedule;
      }
    });

    return NextResponse.json(updatedSchedule);
  } catch (error: any) {
    console.error('Error updating fitting schedule:', error);
    const status = error.message.includes('not found')
      ? 404
      : error.message.includes('Access denied')
      ? 403
      : 500;
    return NextResponse.json(
      { error: 'Error updating fitting schedule', details: error.message },
      { status },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const resolvedParams = await params;
    const scheduleId = parseInt(resolvedParams.id);

    const schedule = await prisma.fittingSchedule.findUnique({
      where: { id: scheduleId },
      include: {
        fittingSlot: {
          select: {
            id: true,
            ownerId: true,
          },
        },
        FittingProduct: true,
      },
    });

    if (!schedule) {
      return NextResponse.json(
        { error: 'Fitting schedule not found' },
        { status: 404 },
      );
    }

    const canDelete =
      caller.role === 'ADMIN' ||
      schedule.userId === caller.id ||
      (caller.role === 'OWNER' && schedule.fittingSlot.ownerId === caller.id);

    if (!canDelete) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.fittingSchedule.update({
        where: { id: scheduleId },
        data: {
          isActive: false,
          deletedAt: new Date(),
        },
      });

      await tx.fittingSlot.update({
        where: { id: schedule.fittingSlotId },
        data: { isBooked: false },
      });
    });

    return NextResponse.json({
      message: 'Fitting schedule canceled successfully',
    });

    return NextResponse.json({
      message: 'Fitting schedule deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting fitting schedule:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 },
    );
  }
}
