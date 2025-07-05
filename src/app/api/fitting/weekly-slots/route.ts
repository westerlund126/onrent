// app/api/fitting/weekly-slots/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';
import {
  WorkingHours,
  UpdateWorkingHoursRequest,
  UpdateWorkingHoursResponse,
  GetWorkingHoursResponse,
  ApiError,
  DEFAULT_WORKING_HOURS,
} from 'types/working-hours';
import {
  validateWorkingHours,
  sanitizeWorkingHours,
  transformToDatabaseFormat,
  transformFromDatabaseFormat,
} from 'utils/working-hours-validation';

const prisma = new PrismaClient();

async function generateFittingSlotsForOwner(
  ownerId: number,
  daysAhead: number = 60,
) {
  console.log('🔍 Starting slot generation for ownerId:', ownerId);
  
  const weeklySlots = await prisma.weeklySlot.findMany({
    where: { ownerId, isEnabled: true },
  });

  console.log('📅 Weekly slots found:', weeklySlots.length);
  console.log('📅 Weekly slots data:', JSON.stringify(weeklySlots, null, 2));

  if (weeklySlots.length === 0) {
    return { count: 0, message: 'No enabled weekly slots found' };
  }

  const slotsToCreate = [];
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + daysAhead);

  console.log('📆 Date range:', startDate.toISOString(), 'to', endDate.toISOString());

  for (
    let date = new Date(startDate);
    date <= endDate;
    date.setDate(date.getDate() + 1)
  ) {
    const dayOfWeek = date.getDay();
    const DAY_OF_WEEK_MAP = {
      0: 'SUNDAY',
      1: 'MONDAY',
      2: 'TUESDAY',
      3: 'WEDNESDAY',
      4: 'THURSDAY',
      5: 'FRIDAY',
      6: 'SATURDAY',
    } as const;

    const dayName = DAY_OF_WEEK_MAP[dayOfWeek as keyof typeof DAY_OF_WEEK_MAP];

    console.log(`🔍 Debug for ${date.toDateString()}:`);
    console.log(`   dayOfWeek (JS): ${dayOfWeek}`);
    console.log(`   dayName (mapped): ${dayName}`);
    console.log(
      `   Available weekly slots for this owner:`,
      weeklySlots.map((s) => ({
        dayOfWeek: s.dayOfWeek,
        isEnabled: s.isEnabled,
        startTime: s.startTime,
        endTime: s.endTime,
      })),
    );

    const weeklySlot = weeklySlots.find(
      (slot) => slot.dayOfWeek === dayName
    );

    console.log(`🗓️  Processing ${date.toDateString()} (${dayName})`);
    console.log(`🎯 Found weekly slot:`, weeklySlot ? 'YES' : 'NO');
    
    if (weeklySlot && weeklySlot.isEnabled) {
      console.log('⏰ Weekly slot details:', {
        dayOfWeek: weeklySlot.dayOfWeek,
        startTime: weeklySlot.startTime,
        endTime: weeklySlot.endTime,
        startTimeType: typeof weeklySlot.startTime,
        endTimeType: typeof weeklySlot.endTime
      });

      let startHour: number;
      let endHour: number;

      if (weeklySlot.startTime instanceof Date) {
        startHour = weeklySlot.startTime.getHours();
        endHour = weeklySlot.endTime.getHours();
        console.log('📝 Parsed as Date objects - Start:', startHour, 'End:', endHour);
      } else {
        const startTimeStr = String(weeklySlot.startTime);
        const endTimeStr = String(weeklySlot.endTime);
        
        startHour = parseInt(startTimeStr.split(':')[0]);
        endHour = parseInt(endTimeStr.split(':')[0]);
        console.log('📝 Parsed as strings - Start:', startHour, 'End:', endHour);
      }
      
      if (startHour === 0 && endHour === 0) {
        console.log('⏭️  Skipping - both hours are 0');
        continue;
      }

      if (endHour <= startHour) {
        console.warn(
          `❌ Invalid time range for ${weeklySlot.dayOfWeek}: ${startHour}:00 - ${endHour}:00`,
        );
        continue;
      }

      console.log(`⏰ Will create slots from ${startHour}:00 to ${endHour}:00`);

      for (let hour = startHour; hour < endHour; hour++) {
        const slotDateTime = new Date(date);
        slotDateTime.setHours(hour, 0, 0, 0);

        console.log(`🕐 Creating slot for: ${slotDateTime.toLocaleString()}`);
        console.log(`🕐 Slot DateTime ISO: ${slotDateTime.toISOString()}`);
        console.log(`🕐 Current time: ${new Date().toISOString()}`);
        console.log(`🕐 Is future slot: ${slotDateTime > new Date()}`);

        if (slotDateTime <= new Date()) {
          console.log('⏭️  Skipping past time slot');
          continue;
        }

        const existingSlot = await prisma.fittingSlot.findFirst({
          where: {
            ownerId,
            dateTime: slotDateTime,
          },
        });

        console.log(`🔍 Existing slot check: ${existingSlot ? 'EXISTS' : 'NOT FOUND'}`);

        if (!existingSlot) {
          console.log('✅ Adding slot to creation queue');
          slotsToCreate.push({
            ownerId,
            dateTime: slotDateTime,
            isAutoConfirm: true,
          });
        }
      }
    }
  }

  console.log(`📊 Total slots to create: ${slotsToCreate.length}`);

  if (slotsToCreate.length > 0) {
    console.log('💾 Creating slots in database...');
    const result = await prisma.fittingSlot.createMany({
      data: slotsToCreate,
      skipDuplicates: true,
    });

    console.log(`✅ Successfully created ${result.count} slots`);

    return {
      count: result.count,
      message: `Generated ${result.count} booking slots for the next ${daysAhead} days`,
    };
  }

  console.log('❌ No slots to create');
  return {
    count: 0,
    message: 'No new slots to generate.',
  };
}

async function checkForExistingBookings(ownerId: number) {
  const existingBookings = await prisma.fittingSchedule.findMany({
    where: {
      fittingSlot: {
        ownerId,
        dateTime: {
          gte: new Date(),
        },
      },
      status: {
        in: ['PENDING', 'CONFIRMED'],
      },
    },
    include: {
      fittingSlot: true,
    },
  });

  return existingBookings;
}

/**
 * GET - Fetch working hours for a user
 */
export async function GET(
  request: NextRequest,
): Promise<NextResponse<GetWorkingHoursResponse | ApiError>> {
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

    let ownerId: number;

    if (caller.role === 'OWNER') {
      ownerId = caller.id;
    } else if (caller.role === 'CUSTOMER') {
      const { searchParams } = new URL(request.url);
      const ownerIdParam = searchParams.get('ownerId');

      if (!ownerIdParam) {
        return NextResponse.json(
          { error: 'Owner ID is required for customers' },
          { status: 400 },
        );
      }

      const parsedOwnerId = parseInt(ownerIdParam);
      if (isNaN(parsedOwnerId)) {
        return NextResponse.json(
          { error: 'Invalid owner ID format' },
          { status: 400 },
        );
      }

      ownerId = parsedOwnerId;

      const targetOwner = await prisma.user.findUnique({
        where: { id: ownerId, role: 'OWNER' },
      });

      if (!targetOwner) {
        return NextResponse.json({ error: 'Owner not found' }, { status: 404 });
      }
    } else if (caller.role === 'ADMIN') {
      const { searchParams } = new URL(request.url);
      const ownerIdParam = searchParams.get('ownerId');

      if (!ownerIdParam) {
        return NextResponse.json(
          { error: 'Owner ID is required for admins' },
          { status: 400 },
        );
      }

      const parsedOwnerId = parseInt(ownerIdParam);
      if (isNaN(parsedOwnerId)) {
        return NextResponse.json(
          { error: 'Invalid owner ID format' },
          { status: 400 },
        );
      }

      ownerId = parsedOwnerId;

      const targetOwner = await prisma.user.findUnique({
        where: { id: ownerId, role: 'OWNER' },
      });

      if (!targetOwner) {
        return NextResponse.json({ error: 'Owner not found' }, { status: 404 });
      }
    } else {
      return NextResponse.json({ error: 'Invalid user role' }, { status: 403 });
    }

    const weeklySlots = await prisma.weeklySlot.findMany({
      where: { ownerId },
      orderBy: { dayOfWeek: 'asc' },
    });

    const workingHours =
      weeklySlots.length > 0
        ? transformFromDatabaseFormat(weeklySlots)
        : DEFAULT_WORKING_HOURS;

    return NextResponse.json({ workingHours });
  } catch (error) {
    console.error('Error fetching working hours:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

/**
 * POST - Create initial working hours (for new owners)
 */
export async function POST(
  request: NextRequest,
): Promise<NextResponse<UpdateWorkingHoursResponse | ApiError>> {
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
        { error: 'Only owners can create working hours' },
        { status: 403 },
      );
    }

    const existingSlots = await prisma.weeklySlot.findFirst({
      where: { ownerId: caller.id },
    });

    if (existingSlots) {
      return NextResponse.json(
        { error: 'Working hours already exist. Use PATCH to update.' },
        { status: 409 },
      );
    }

    const body: UpdateWorkingHoursRequest = await request.json();
    const { workingHours } = body;

    const validation = validateWorkingHours(workingHours);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: 'Invalid working hours data',
          details: validation.errors
            .map((e) => `${e.field}: ${e.message}`)
            .join('; '),
        },
        { status: 400 },
      );
    }

    const sanitizedWorkingHours = sanitizeWorkingHours(workingHours);
    const weeklySlots = transformToDatabaseFormat(
      sanitizedWorkingHours,
      caller.id,
    );

    await prisma.weeklySlot.createMany({
      data: weeklySlots,
    });

    const slotGeneration = await generateFittingSlotsForOwner(caller.id, 60);

    return NextResponse.json({
      message: 'Working hours updated successfully',
      ownerId: caller.id,
      workingHours: sanitizedWorkingHours,
      slotsGenerated: slotGeneration.count,
      slotGeneration,
    });
  } catch (error) {
    console.error('Error creating working hours:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

/**
 * PATCH - Update existing working hours with automatic slot generation
 */
export async function PATCH(
  request: NextRequest,
): Promise<NextResponse<UpdateWorkingHoursResponse | ApiError>> {
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
        { error: 'Only owners can update working hours' },
        { status: 403 },
      );
    }

    // Check for existing bookings that would be affected
    const existingBookings = await checkForExistingBookings(caller.id);
    if (existingBookings.length > 0) {
      return NextResponse.json(
        {
          error:
            'Cannot update working hours while you have active bookings. Please cancel or complete existing bookings first.',
          bookingCount: existingBookings.length,
        },
        { status: 409 },
      );
    }

    const body: UpdateWorkingHoursRequest = await request.json();
    const { workingHours } = body;

    const validation = validateWorkingHours(workingHours);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: 'Invalid working hours data',
          details: validation.errors
            .map((e) => `${e.field}: ${e.message}`)
            .join('; '),
        },
        { status: 400 },
      );
    }

    const sanitizedWorkingHours = sanitizeWorkingHours(workingHours);
    const weeklySlots = transformToDatabaseFormat(
      sanitizedWorkingHours,
      caller.id,
    );

    await prisma.$transaction(async (tx) => {
      await tx.weeklySlot.deleteMany({
        where: { ownerId: caller.id },
      });

      await tx.weeklySlot.createMany({
        data: weeklySlots,
      });

      await tx.fittingSlot.deleteMany({
        where: {
          ownerId: caller.id,
          isBooked: false,
          dateTime: {
            gt: new Date(),
          },
        },
      });
    });

    const slotGeneration = await generateFittingSlotsForOwner(caller.id, 60);

    return NextResponse.json({
      message: 'Working hours updated successfully',
      ownerId: caller.id,
      workingHours: sanitizedWorkingHours,
      slotGeneration,
    });
  } catch (error) {
    console.error('Error updating working hours:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
