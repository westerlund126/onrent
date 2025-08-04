// app/api/fitting/slots/route.ts - COMPLETE FIXED VERSION
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

    let ownerId: number;

    if (caller.role === 'OWNER') {
      ownerId = caller.id;
    } else {
      if (!ownerIdParam) {
        return NextResponse.json(
          { error: 'Owner ID is required for customer requests' },
          { status: 400 }
        );
      }
      const parsedOwnerId = parseInt(ownerIdParam);
      if (isNaN(parsedOwnerId)) {
        return NextResponse.json(
          { error: 'Invalid Owner ID - must be a number' },
          { status: 400 }
        );
      }
      ownerId = parsedOwnerId;
    }
    
    // ... (Your validation logic for ownerExists can remain here) ...

    // =================== FIX STARTS HERE ===================
    // Build where clauses using a more robust method

    // 1. Define the slot where clause
    const slotWhereClause: any = {
      ownerId,
    };
    if (availableOnly) {
      slotWhereClause.isBooked = false;
    }

    // 2. Define the block where clause conditions in an array
    const blockWhereConditions: any[] = [{ ownerId }];

    // 3. Add date filters to both clauses
    if (dateFrom && dateTo) {
      const parsedDateFrom = new Date(dateFrom);
      const parsedDateTo = new Date(dateTo);

      if (isNaN(parsedDateFrom.getTime()) || isNaN(parsedDateTo.getTime())) {
        return NextResponse.json(
            { error: 'Invalid date format' },
            { status: 400 },
        );
      }

      // Add date range to slots
      slotWhereClause.dateTime = {
        gte: parsedDateFrom,
        lte: parsedDateTo,
      };

      // Add overlapping date range to blocks.
      // A block overlaps if it starts before the range ends AND ends after the range starts.
      blockWhereConditions.push({ startTime: { lt: parsedDateTo } });
      blockWhereConditions.push({ endTime: { gt: parsedDateFrom } });
    }

    // 4. Construct the final block where clause
    const finalBlockWhereClause = { AND: blockWhereConditions };

    // 🔍 DEBUG: Log the final, corrected where clauses
    console.log('🔍 API Final Where Clauses:', {
      slotWhereClause: JSON.stringify(slotWhereClause, null, 2),
      blockWhereClause: JSON.stringify(finalBlockWhereClause, null, 2),
    });
    // =================== FIX ENDS HERE ===================

    const [slots, scheduleBlocks] = await Promise.all([
      prisma.fittingSlot.findMany({
        where: slotWhereClause, // Use the new slot clause
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
          fittingSchedules: {
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
        where: finalBlockWhereClause, // Use the new, corrected block clause
      }),
    ]);

    // ... (The rest of your file remains the same, including the filtering logic) ...

    // Filter out slots that conflict with schedule blocks
    const filteredSlots = slots.filter((slot) => {
      const FITTING_DURATION_MS = 60 * 60 * 1000; // 1 hour
      const slotStartTime = new Date(slot.dateTime);
      const slotEndTime = new Date(slotStartTime.getTime() + FITTING_DURATION_MS);

      const isBlocked = scheduleBlocks.some((block) => {
        const overlaps = slotStartTime < block.endTime && slotEndTime > block.startTime;
        return overlaps;
      });
      
      return !isBlocked; // Return slots that are NOT blocked
    });

    return NextResponse.json(filteredSlots);

  } catch (error: any) {
    console.error('💥 Error in /api/fitting/slots:', error);
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

    console.log('🔍 Creating slot for:', {
      originalDateTime: dateTime,
      parsedDateTime: slotDateTime.toISOString(),
      localString: slotDateTime.toLocaleString(),
      ownerId: caller.id,
    });

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
        fittingSchedules: {
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
    console.error('💥 Error creating fitting slot:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 },
    );
  }
}