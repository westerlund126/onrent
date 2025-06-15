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

    return NextResponse.json({
      message: 'Working hours created successfully',
      ownerId: caller.id,
      workingHours: sanitizedWorkingHours,
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
 * PATCH - Update existing working hours
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
    });

    return NextResponse.json({
      message: 'Working hours updated successfully',
      ownerId: caller.id,
      workingHours: sanitizedWorkingHours,
    });
  } catch (error) {
    console.error('Error updating working hours:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}