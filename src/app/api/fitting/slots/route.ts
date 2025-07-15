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
    const ownerId = searchParams.get('ownerId');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
     const availableOnly = searchParams.get('availableOnly') === 'true';

    let whereClause: any = {};

    if (caller.role === 'OWNER') {
      whereClause.ownerId = caller.id;
    } else if (ownerId) {
      whereClause.ownerId = parseInt(ownerId);
    }

    if (dateFrom || dateTo) {
      whereClause.dateTime = {};
      if (dateFrom) {
		  const parsedDateFrom = new Date(dateFrom);
		  if (isNaN(parsedDateFrom.getTime())) {
			return NextResponse.json({ error: 'Invalid dateFrom' }, { status: 400 });
		  }
		  whereClause.dateTime.gte = parsedDateFrom.toISOString();
		}
		
		if (dateTo) {
		  const parsedDateTo = new Date(dateTo);
		  if (isNaN(parsedDateTo.getTime())) {
			return NextResponse.json({ error: 'Invalid dateTo' }, { status: 400 });
		  }
		  whereClause.dateTime.lte = parsedDateTo.toISOString();
		}
    }

    if (availableOnly) {
      whereClause.isBooked = false;
    }

    const slots = await prisma.fittingSlot.findMany({
      where: whereClause,
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
    });
    console.log('Found slots:', slots.length);
    return NextResponse.json(slots);
    
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

    const existingSlot = await prisma.fittingSlot.findFirst({
      where: {
        ownerId: caller.id,
        dateTime: new Date(dateTime),
      },
    });

    if (existingSlot) {
      return NextResponse.json(
        { error: 'A fitting slot already exists at this time' },
        { status: 400 },
      );
    }

    const slot = await prisma.fittingSlot.create({
      data: {
        ownerId: caller.id,
        dateTime: new Date(dateTime),
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
