// app/api/fitting/slots/route.ts - CORRECTED VERSION
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

    // =================== THE FIX: SIMPLIFIED APPROACH ===================
    
    // 1. Build the slot where clause (this part was correct)
    const slotWhereClause: any = {
      ownerId,
    };
    if (availableOnly) {
      slotWhereClause.isBooked = false;
    }

    // Add date filters to slots if provided
    if (dateFrom && dateTo) {
      const parsedDateFrom = new Date(dateFrom);
      const parsedDateTo = new Date(dateTo);

      if (isNaN(parsedDateFrom.getTime()) || isNaN(parsedDateTo.getTime())) {
        return NextResponse.json(
          { error: 'Invalid date format' },
          { status: 400 },
        );
      }

      slotWhereClause.dateTime = {
        gte: parsedDateFrom,
        lte: parsedDateTo,
      };
    }

    // 2. For schedule blocks: Fetch ALL blocks for this owner
    // We'll do the date filtering in memory after fetching
    const scheduleBlockWhereClause = {
      ownerId, // Only filter by owner - get ALL blocks for this owner
    };

    // 🔍 DEBUG: Log the where clauses
    console.log('🔍 API Where Clauses:', {
      ownerId,
      callerRole: caller.role,
      slotWhereClause: JSON.stringify(slotWhereClause, null, 2),
      scheduleBlockWhereClause: JSON.stringify(scheduleBlockWhereClause, null, 2),
      dateRange: dateFrom && dateTo ? { from: dateFrom, to: dateTo } : 'No date range'
    });

    // 3. Fetch both slots and ALL schedule blocks for the owner
    const [slots, allScheduleBlocks] = await Promise.all([
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
        where: scheduleBlockWhereClause, // Fetch ALL blocks for this owner
        orderBy: {
          startTime: 'asc',
        },
      }),
    ]);

    // 🔍 DEBUG: Log what we retrieved
    console.log('🔍 Retrieved Data:', {
      totalSlots: slots.length,
      totalScheduleBlocks: allScheduleBlocks.length,
      scheduleBlocks: allScheduleBlocks.map(block => ({
        id: block.id,
        description: block.description,
        startTime: block.startTime.toISOString(),
        endTime: block.endTime.toISOString(),
        startLocal: block.startTime.toLocaleString(),
        endLocal: block.endTime.toLocaleString(),
      })),
      sampleSlots: slots.slice(0, 3).map(slot => ({
        id: slot.id,
        dateTime: slot.dateTime,
        isBooked: slot.isBooked,
      }))
    });

    // 4. Filter out slots that conflict with schedule blocks
    const FITTING_DURATION_MS = 60 * 60 * 1000; // 1 hour
    
    const filteredSlots = slots.filter((slot) => {
      const slotStartTime = new Date(slot.dateTime);
      const slotEndTime = new Date(slotStartTime.getTime() + FITTING_DURATION_MS);

      // Check if this slot conflicts with ANY schedule block
      const conflictingBlock = allScheduleBlocks.find((block) => {
        // A slot conflicts with a block if they overlap
        const overlaps = slotStartTime < block.endTime && slotEndTime > block.startTime;
        
        if (overlaps) {
          console.log('🚫 BLOCKING SLOT:', {
            slotId: slot.id,
            slotTime: slotStartTime.toISOString(),
            slotTimeLocal: slotStartTime.toLocaleString(),
            blockId: block.id,
            blockDescription: block.description,
            blockStart: block.startTime.toISOString(),
            blockEnd: block.endTime.toISOString(),
            blockStartLocal: block.startTime.toLocaleString(),
            blockEndLocal: block.endTime.toLocaleString(),
          });
        }
        
        return overlaps;
      });

      const isBlocked = !!conflictingBlock;
      return !isBlocked; // Return slots that are NOT blocked
    });

    // 🔍 DEBUG: Show filtering results
    console.log('🔍 Filtering Results:', {
      originalSlotCount: slots.length,
      filteredSlotCount: filteredSlots.length,
      blockedSlotCount: slots.length - filteredSlots.length,
      blockedSlots: slots.filter(slot => {
        const slotStartTime = new Date(slot.dateTime);
        const slotEndTime = new Date(slotStartTime.getTime() + FITTING_DURATION_MS);
        return allScheduleBlocks.some(block => 
          slotStartTime < block.endTime && slotEndTime > block.startTime
        );
      }).map(slot => ({
        id: slot.id,
        dateTime: slot.dateTime,
        localTime: new Date(slot.dateTime).toLocaleString(),
      }))
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

    // Get ALL schedule blocks for this owner (same approach as GET)
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
    const conflictingBlocks = allBlocks.filter(block => {
      const overlaps = slotStartTime < block.endTime && slotEndTime > block.startTime;
      return overlaps;
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