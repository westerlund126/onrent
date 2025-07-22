// app/api/fitting/slots/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

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
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const availableOnly = searchParams.get('availableOnly') === 'true';

    const ownerId =
      caller.role === 'OWNER' ? caller.id : parseInt(ownerIdParam!);

    if (!ownerId) {
      return NextResponse.json(
        { error: 'Owner ID is required' },
        { status: 400 },
      );
    }

    let slotWhereClause: any = { ownerId };
    let blockWhereClause: any = { ownerId };

    if (dateFrom || dateTo) {
      slotWhereClause.dateTime = {};

      const blockTimeFilter = [];
      if (dateFrom) {
        const parsedDateFrom = new Date(dateFrom);
        if (isNaN(parsedDateFrom.getTime())) {
          return NextResponse.json(
            { error: 'Invalid dateFrom' },
            { status: 400 },
          );
        }
        slotWhereClause.dateTime.gte = parsedDateFrom.toISOString();
        blockTimeFilter.push({ endTime: { gt: parsedDateFrom } });
      }

      if (dateTo) {
        const parsedDateTo = new Date(dateTo);
        if (isNaN(parsedDateTo.getTime())) {
          return NextResponse.json(
            { error: 'Invalid dateTo' },
            { status: 400 },
          );
        }
        slotWhereClause.dateTime.lte = parsedDateTo.toISOString();
        blockTimeFilter.push({ startTime: { lt: parsedDateTo } });
      }
      blockWhereClause.AND = blockTimeFilter;
    }

    if (availableOnly) {
      slotWhereClause.isBooked = false;
    }

    const [slots, scheduleBlocks] = await Promise.all([
      prisma.fittingSlot.findMany({
        where: slotWhereClause,
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
            },
          },
        },
        orderBy: {
          dateTime: 'asc',
        },
      }),
      prisma.scheduleBlock.findMany({
        where: blockWhereClause,
      }),
    ]);

    if (scheduleBlocks.length === 0) {
      return NextResponse.json(slots);
    }

    const filteredSlots = slots.filter((slot) => {
      const FITTING_DURATION_MS = 60 * 60 * 1000;
      const slotStartTime = new Date(slot.dateTime);
      const slotEndTime = new Date(
        slotStartTime.getTime() + FITTING_DURATION_MS,
      );

      const isBlocked = scheduleBlocks.some(
        (block) =>
          slotStartTime < block.endTime && slotEndTime > block.startTime,
      );

      return !isBlocked;
    });

    return NextResponse.json(filteredSlots);
  } catch (error: any) {
    console.error('Error fetching fitting slots:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 },
    );
  }
}

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

    if (caller.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Only business owners can create fitting slots' },
        { status: 403 },
      );
    }

    const { dateTime } = await request.json();

    if (!dateTime) {
      return NextResponse.json(
        { error: 'DateTime is required' },
        { status: 400 },
      );
    }

    const slotDateTime = new Date(dateTime);

    // DEBUG: Log the slot time
    console.log('🔍 Creating slot for:', {
      originalDateTime: dateTime,
      parsedDateTime: slotDateTime.toISOString(),
      localString: slotDateTime.toLocaleString(),
      ownerId: caller.id,
    });

    // Check if slot already exists
    const existingSlot = await prisma.fittingSlot.findFirst({
      where: {
        ownerId: caller.id,
        dateTime: slotDateTime,
      },
    });

    if (existingSlot) {
      return NextResponse.json(
        { error: 'A fitting slot already exists at this time' },
        { status: 400 },
      );
    }

    // Check against schedule blocks with debugging
    const FITTING_DURATION_MS = 60 * 60 * 1000; // 1 hour
    const slotStartTime = slotDateTime;
    const slotEndTime = new Date(slotStartTime.getTime() + FITTING_DURATION_MS);

    // DEBUG: First get ALL schedule blocks for this owner
    const allBlocks = await prisma.scheduleBlock.findMany({
      where: {
        ownerId: caller.id,
      },
    });

    console.log(
      '🔍 All schedule blocks for owner:',
      allBlocks.map((block) => ({
        id: block.id,
        description: block.description,
        startTime: block.startTime.toISOString(),
        endTime: block.endTime.toISOString(),
        startTimeLocal: block.startTime.toLocaleString(),
        endTimeLocal: block.endTime.toLocaleString(),
      })),
    );

    console.log('🔍 Slot time range:', {
      slotStart: slotStartTime.toISOString(),
      slotEnd: slotEndTime.toISOString(),
      slotStartLocal: slotStartTime.toLocaleString(),
      slotEndLocal: slotEndTime.toLocaleString(),
    });

    // Now check for conflicts with detailed logging
    const conflictingBlocks = await prisma.scheduleBlock.findMany({
      where: {
        ownerId: caller.id,
        AND: [
          { startTime: { lt: slotEndTime } },
          { endTime: { gt: slotStartTime } },
        ],
      },
    });

    console.log(
      '🔍 Conflicting blocks found:',
      conflictingBlocks.map((block) => ({
        id: block.id,
        description: block.description,
        startTime: block.startTime.toISOString(),
        endTime: block.endTime.toISOString(),
        conflicts: {
          blockStartBeforeSlotEnd: block.startTime < slotEndTime,
          blockEndAfterSlotStart: block.endTime > slotStartTime,
        },
      })),
    );

    if (conflictingBlocks.length > 0) {
      const blockDetails = conflictingBlocks
        .map(
          (block) =>
            `${block.startTime.toLocaleString()} - ${block.endTime.toLocaleString()}: ${
              block.description
            }`,
        )
        .join(', ');

      console.log('❌ Rejecting slot creation due to conflicts');

      return NextResponse.json(
        {
          error: 'Cannot create slot - conflicts with schedule block(s)',
          details: `Conflicting blocks: ${blockDetails}`,
          debug: {
            slotTime: slotStartTime.toLocaleString(),
            conflictingBlocks: conflictingBlocks.length,
          },
        },
        { status: 400 },
      );
    }

    console.log('✅ No conflicts found, creating slot');

    const slot = await prisma.fittingSlot.create({
      data: {
        ownerId: caller.id,
        dateTime: slotDateTime,
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
          },
        },
      },
    });

    return NextResponse.json(slot);
  } catch (error: any) {
    console.error('Error creating fitting slot:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 },
    );
  }
}
