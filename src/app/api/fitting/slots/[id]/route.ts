// app/api/fitting/slots/[id]/route.ts
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

    const resolvedParams = await params; 
    const slotId = parseInt(resolvedParams.id);

    const slot = await prisma.fittingSlot.findUnique({
      where: { id: slotId },
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
        fittingSchedule: {
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
            FittingProduct: {
              include: {
                variantProduct: {
                  select: {
                    id: true,
                    size: true,
                    color: true,
                    sku: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!slot) {
      return NextResponse.json(
        { error: 'Fitting slot not found' },
        { status: 404 },
      );
    }

    return NextResponse.json(slot);
  } catch (error: any) {
    console.error('Error fetching fitting slot:', error);
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
    const slotId = parseInt(resolvedParams.id);

    const slot = await prisma.fittingSlot.findUnique({
      where: { id: slotId },
    });

    if (!slot) {
      return NextResponse.json(
        { error: 'Fitting slot not found' },
        { status: 404 },
      );
    }

    if (caller.role !== 'OWNER' || slot.ownerId !== caller.id) {
      return NextResponse.json(
        { error: 'You can only update your own fitting slots' },
        { status: 403 },
      );
    }

    const updates = await request.json();

    if (slot.isBooked && !updates.allowUpdateWhenBooked) {
      return NextResponse.json(
        { error: 'Cannot update a booked fitting slot' },
        { status: 400 },
      );
    }

    const updatedSlot = await prisma.fittingSlot.update({
      where: { id: slotId },
      data: {
        ...(updates.dateTime && { dateTime: new Date(updates.dateTime) }),
      },
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
        fittingSchedule: {
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
            FittingProduct: {
              include: {
                variantProduct: {
                  select: {
                    id: true,
                    size: true,
                    color: true,
                    sku: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json(updatedSlot);
  } catch (error: any) {
    console.error('Error updating fitting slot:', error);
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
    const slotId = parseInt(resolvedParams.id);

    const slot = await prisma.fittingSlot.findUnique({
      where: { id: slotId },
      include: {
        fittingSchedule: true,
      },
    });

    if (!slot) {
      return NextResponse.json(
        { error: 'Fitting slot not found' },
        { status: 404 },
      );
    }

    if (caller.role !== 'OWNER' || slot.ownerId !== caller.id) {
      return NextResponse.json(
        { error: 'You can only delete your own fitting slots' },
        { status: 403 },
      );
    }

    if (slot.isBooked && slot.fittingSchedule) {
      return NextResponse.json(
        {
          error:
            'Cannot delete a booked fitting slot. Cancel the schedule first.',
        },
        { status: 400 },
      );
    }

    await prisma.fittingSlot.delete({
      where: { id: slotId },
    });

    return NextResponse.json({
      message: 'Fitting slot deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting fitting slot:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 },
    );
  }
}
