// app/api/fitting/available-slots/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get('ownerId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    console.log('Available slots request:', { ownerId, startDate, endDate });

    if (!ownerId) {
      return NextResponse.json(
        { error: 'Owner ID is required' },
        { status: 400 }
      );
    }

    // Default to next 30 days if no date range provided
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    console.log('Date range:', { start: start.toISOString(), end: end.toISOString() });

    // Get available slots for the owner within date range
    const availableSlots = await prisma.fittingSlot.findMany({
      where: {
        ownerId: parseInt(ownerId),
        dateTime: {
          gte: start,
          lte: end,
        },
        isBooked: false,
      },
      orderBy: {
        dateTime: 'asc',
      },
    });

    console.log('Found slots:', availableSlots.length);

    return NextResponse.json(availableSlots);
  } catch (error) {
    console.error('Error fetching available slots:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}