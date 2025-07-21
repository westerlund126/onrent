// app/api/fitting/schedule-blocks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

const createScheduleBlockSchema = z
  .object({
    startTime: z.string().datetime('Invalid start time format'),
    endTime: z.string().datetime('Invalid end time format'),
    description: z.string().min(1, 'Description is required'),
  })
  .refine(
    (data) => {
      const startTime = new Date(data.startTime);
      const endTime = new Date(data.endTime);
      return endTime > startTime;
    },
    {
      message: 'End time must be after start time',
      path: ['endTime'],
    },
  );

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const validatedData = createScheduleBlockSchema.parse(body);

    const scheduleBlock = await prisma.scheduleBlock.create({
      data: {
        startTime: new Date(validatedData.startTime),
        endTime: new Date(validatedData.endTime),
        description: validatedData.description,
        ownerId: caller.id,
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

    return NextResponse.json(scheduleBlock, { status: 201 });
  } catch (error) {
    console.error('Failed to create schedule block:', error);

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
      { error: 'Failed to create schedule block' },
      { status: 500 },
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
    const ownerId = searchParams.get('ownerId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let whereClause: any = {};

    if (caller.role === 'OWNER') {
      whereClause.ownerId = caller.id;
    } else if (ownerId) {
      whereClause.ownerId = parseInt(ownerId);
    }

    // Date filtering
    if (startDate && endDate) {
      whereClause.AND = [
        {
          startTime: {
            gte: new Date(startDate),
          },
        },
        {
          endTime: {
            lte: new Date(endDate),
          },
        },
      ];
    }

    const scheduleBlocks = await prisma.scheduleBlock.findMany({
      where: whereClause,
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
      orderBy: {
        startTime: 'asc',
      },
    });

    return NextResponse.json({ scheduleBlocks });
  } catch (error: any) {
    console.error('Failed to fetch schedule blocks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedule blocks', details: error.message },
      { status: 500 },
    );
  }
}
