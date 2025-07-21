// app/api/fitting/schedule-blocks/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

const updateScheduleBlockSchema = z
  .object({
    startTime: z.string().datetime('Invalid start time format').optional(),
    endTime: z.string().datetime('Invalid end time format').optional(),
    description: z.string().min(1, 'Description is required').optional(),
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        const startTime = new Date(data.startTime);
        const endTime = new Date(data.endTime);
        return endTime > startTime;
      }
      return true;
    },
    {
      message: 'End time must be after start time',
      path: ['endTime'],
    },
  );

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
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
    const blockId = parseInt(resolvedParams.id);

    if (isNaN(blockId)) {
      return NextResponse.json(
        { error: 'Invalid schedule block ID' },
        { status: 400 },
      );
    }

    const scheduleBlock = await prisma.scheduleBlock.findUnique({
      where: {
        id: blockId,
      },
      include: {
        owner: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            businessName: true,
          },
        },
      },
    });

    if (!scheduleBlock) {
      return NextResponse.json(
        { error: 'Schedule block not found' },
        { status: 404 },
      );
    }

    if (caller.role === 'OWNER' && scheduleBlock.ownerId !== caller.id) {
      return NextResponse.json(
        { error: 'Forbidden - Access denied' },
        { status: 403 },
      );
    }

    return NextResponse.json(scheduleBlock);
  } catch (error: any) {
    console.error('Failed to fetch schedule block:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedule block', details: error.message },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
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
    const blockId = parseInt(resolvedParams.id);

    if (isNaN(blockId)) {
      return NextResponse.json(
        { error: 'Invalid schedule block ID' },
        { status: 400 },
      );
    }

    const body = await request.json();
    const validatedData = updateScheduleBlockSchema.parse(body);

    const existingBlock = await prisma.scheduleBlock.findUnique({
      where: { id: blockId },
    });

    if (!existingBlock) {
      return NextResponse.json(
        { error: 'Schedule block not found' },
        { status: 404 },
      );
    }

    if (caller.role === 'OWNER' && existingBlock.ownerId !== caller.id) {
      return NextResponse.json(
        { error: 'Forbidden - Access denied' },
        { status: 403 },
      );
    }

    const scheduleBlock = await prisma.scheduleBlock.update({
      where: {
        id: blockId,
      },
      data: {
        ...(validatedData.startTime && {
          startTime: new Date(validatedData.startTime),
        }),
        ...(validatedData.endTime && {
          endTime: new Date(validatedData.endTime),
        }),
        ...(validatedData.description && {
          description: validatedData.description,
        }),
      },
      include: {
        owner: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            businessName: true,
          },
        },
      },
    });

    return NextResponse.json(scheduleBlock);
  } catch (error: any) {
    console.error('Failed to update schedule block:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: 'Failed to update schedule block', details: error.message },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
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
    const blockId = parseInt(resolvedParams.id);

    if (isNaN(blockId)) {
      return NextResponse.json(
        { error: 'Invalid schedule block ID' },
        { status: 400 },
      );
    }

    const existingBlock = await prisma.scheduleBlock.findUnique({
      where: { id: blockId },
    });

    if (!existingBlock) {
      return NextResponse.json(
        { error: 'Schedule block not found' },
        { status: 404 },
      );
    }

    if (caller.role === 'OWNER' && existingBlock.ownerId !== caller.id) {
      return NextResponse.json(
        { error: 'Forbidden - Access denied' },
        { status: 403 },
      );
    }

    await prisma.scheduleBlock.delete({
      where: {
        id: blockId,
      },
    });

    return NextResponse.json(
      { message: 'Schedule block deleted successfully' },
      { status: 200 },
    );
  } catch (error: any) {
    console.error('Failed to delete schedule block:', error);

    return NextResponse.json(
      { error: 'Failed to delete schedule block', details: error.message },
      { status: 500 },
    );
  }
}
