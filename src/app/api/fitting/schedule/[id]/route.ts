// app/api/fitting/schedule/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

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
                isAutoConfirm: true, // Add owner's auto-confirm setting
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

    const schedule = await prisma.fittingSchedule.findUnique({
      where: { id: scheduleId },
      include: {
        fittingSlot: {
          include: {
            owner: {
              select: {
                id: true,
                isAutoConfirm: true, // Include for reference
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

    const canUpdate =
      caller.role === 'ADMIN' ||
      schedule.userId === caller.id ||
      (caller.role === 'OWNER' && schedule.fittingSlot.ownerId === caller.id);

    if (!canUpdate) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const updates = await request.json();

    if (updates.status) {
      const validStatuses = [
        'PENDING',
        'CONFIRMED',
        'REJECTED',
        'COMPLETED',
        'CANCELED',
      ];
      if (!validStatuses.includes(updates.status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }

      if (schedule.status === 'COMPLETED' && updates.status !== 'COMPLETED') {
        return NextResponse.json(
          { error: 'Cannot change status of completed appointment' },
          { status: 400 },
        );
      }

      if (schedule.status === 'CANCELED' && updates.status !== 'CANCELED') {
        return NextResponse.json(
          { error: 'Cannot change status of canceled appointment' },
          { status: 400 },
        );
      }
    }

    const updatedSchedule = await prisma.$transaction(async (tx) => {
      if (updates.status === 'CANCELED' && schedule.status !== 'CANCELED') {
        await tx.fittingSlot.update({
          where: { id: schedule.fittingSlotId },
          data: { isBooked: false },
        });
      }

      return await tx.fittingSchedule.update({
        where: { id: scheduleId },
        data: {
          ...(updates.status && { status: updates.status }),
          ...(updates.note !== undefined && { note: updates.note }),
          ...(updates.duration && { duration: updates.duration }),
        },
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
                  isAutoConfirm: true, // Add owner's auto-confirm setting
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
    });

    return NextResponse.json(updatedSchedule);
  } catch (error: any) {
    console.error('Error updating fitting schedule:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 },
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
        fittingSlot: true,
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
      if (schedule.FittingProduct.length > 0) {
        await tx.fittingProduct.deleteMany({
          where: { fittingId: scheduleId },
        });
      }

      await tx.fittingSchedule.delete({
        where: { id: scheduleId },
      });

      await tx.fittingSlot.update({
        where: { id: schedule.fittingSlotId },
        data: { isBooked: false },
      });
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
