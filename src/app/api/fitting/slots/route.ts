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

    // 🔧 FIXED: Robust ownerId handling for both owner and customer
    let ownerId: number;

    if (caller.role === 'OWNER') {
      // Owner can optionally specify ownerId, but defaults to their own ID
      if (ownerIdParam) {
        const parsedOwnerId = parseInt(ownerIdParam);
        if (isNaN(parsedOwnerId)) {
          return NextResponse.json(
            { error: 'Invalid Owner ID - must be a number' },
            { status: 400 }
          );
        }
        ownerId = parsedOwnerId;
      } else {
        ownerId = caller.id; // Use owner's own ID
      }
    } else {
      // Customer MUST specify ownerId
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

    // 🔍 DEBUG: Log request details
    console.log('🔍 API /fitting/slots GET - Request Analysis:', {
      callerRole: caller.role,
      callerId: caller.id,
      ownerIdParam,
      ownerIdParamType: typeof ownerIdParam,
      finalOwnerId: ownerId,
      finalOwnerIdType: typeof ownerId,
      ownerIdValid: !isNaN(ownerId),
      dateFrom,
      dateTo,
      availableOnly,
      requestUrl: request.url
    });

    // Validate ownerId exists and is actually an owner
    const ownerExists = await prisma.user.findUnique({
      where: { id: ownerId },
      select: { id: true, role: true, businessName: true }
    });

    if (!ownerExists) {
      return NextResponse.json(
        { error: `Owner with ID ${ownerId} not found` },
        { status: 404 }
      );
    }

    if (ownerExists.role !== 'OWNER') {
      return NextResponse.json(
        { error: `User ${ownerId} is not an owner (role: ${ownerExists.role})` },
        { status: 400 }
      );
    }

    console.log('✅ Owner validation passed:', {
      ownerId,
      ownerRole: ownerExists.role,
      businessName: ownerExists.businessName
    });

    // Build where clauses
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
      
      if (blockTimeFilter.length > 0) {
        blockWhereClause.AND = blockTimeFilter;
      }
    }

    if (availableOnly) {
      slotWhereClause.isBooked = false;
    }

    // 🔍 DEBUG: Log where clauses
    console.log('🔍 API Where Clauses:', {
      slotWhereClause: JSON.stringify(slotWhereClause, null, 2),
      blockWhereClause: JSON.stringify(blockWhereClause, null, 2)
    });

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
        where: blockWhereClause,
      }),
    ]);

    // 🔍 DEBUG: Log raw database results
    console.log('🔍 API Raw Database Results:', {
      totalSlots: slots.length,
      totalScheduleBlocks: scheduleBlocks.length,
      callerInfo: `${caller.role} (ID: ${caller.id})`,
      targetOwnerId: ownerId,
      firstFewSlots: slots.slice(0, 3).map(slot => ({
        id: slot.id,
        dateTime: slot.dateTime,
        isBooked: slot.isBooked,
        ownerId: slot.ownerId
      })),
      allScheduleBlocks: scheduleBlocks.map(block => ({
        id: block.id,
        ownerId: block.ownerId,
        startTime: block.startTime.toISOString(),
        endTime: block.endTime.toISOString(),
        description: block.description,
        startTimeLocal: block.startTime.toLocaleString(),
        endTimeLocal: block.endTime.toLocaleString()
      }))
    });

    // 🔍 DEBUG: Look for the specific 9 AM slot
    const nineAmSlot = slots.find(slot => slot.dateTime.toISOString() === '2025-08-04T09:00:00.000Z');
    if (nineAmSlot) {
      console.log('🔍 Found 9 AM slot in database:', {
        id: nineAmSlot.id,
        dateTime: nineAmSlot.dateTime.toISOString(),
        isBooked: nineAmSlot.isBooked,
        ownerId: nineAmSlot.ownerId
      });
    }

    // If no schedule blocks found, return all slots (no filtering needed)
    if (scheduleBlocks.length === 0) {
      console.log('⚠️ NO SCHEDULE BLOCKS found - returning all slots unfiltered');
      return NextResponse.json(slots);
    }

    // Filter out slots that conflict with schedule blocks
    const filteredSlots = slots.filter((slot) => {
      const FITTING_DURATION_MS = 60 * 60 * 1000; // 1 hour
      const slotStartTime = new Date(slot.dateTime);
      const slotEndTime = new Date(slotStartTime.getTime() + FITTING_DURATION_MS);

      const isBlocked = scheduleBlocks.some((block) => {
        const overlaps = slotStartTime < block.endTime && slotEndTime > block.startTime;
        
        // 🔍 DEBUG: Log each overlap check for 9 AM slot
        if (slot.dateTime.toISOString() === '2025-08-04T09:00:00.000Z') {
          console.log('🔍 Checking 9 AM slot against block:', {
            slotStart: slotStartTime.toISOString(),
            slotEnd: slotEndTime.toISOString(),
            blockStart: block.startTime.toISOString(),
            blockEnd: block.endTime.toISOString(),
            blockDescription: block.description,
            overlaps,
            calculation: {
              slotStartLessThanBlockEnd: slotStartTime < block.endTime,
              slotEndGreaterThanBlockStart: slotEndTime > block.startTime
            }
          });
        }
        
        return overlaps;
      });

      // 🔍 DEBUG: Log if 9 AM slot gets filtered
      if (slot.dateTime.toISOString() === '2025-08-04T09:00:00.000Z') {
        console.log(isBlocked ? '✅ 9 AM slot BLOCKED (correct)' : '❌ 9 AM slot NOT BLOCKED (problem!)');
      }

      return !isBlocked; // Return slots that are NOT blocked
    });

    // 🔍 DEBUG: Final filtering results
    console.log('🔍 API Filtering Results:', {
      originalSlotsCount: slots.length,
      filteredSlotsCount: filteredSlots.length,
      slotsRemoved: slots.length - filteredSlots.length,
      nineAmSlotInFiltered: filteredSlots.some(slot => slot.dateTime.toISOString() === '2025-08-04T09:00:00.000Z'),
      requestedBy: `${caller.role} ${caller.id}`,
      forOwner: ownerId
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