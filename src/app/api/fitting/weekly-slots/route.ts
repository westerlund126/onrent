// app/api/fitting/weekly-slots/route.ts - Modified for testing without auth
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ownerId, weeklySlots } = body;

    // Check if ownerId is provided
    if (!ownerId) {
      return NextResponse.json(
        { error: 'Owner ID is required' },
        { status: 400 }
      );
    }

    // Verify owner exists
    const owner = await prisma.user.findUnique({
      where: { id: parseInt(ownerId) },
    });

    if (!owner) {
      return NextResponse.json(
        { error: 'Owner not found' },
        { status: 404 }
      );
    }

    // Delete existing weekly slots for this owner
    await prisma.weeklySlot.deleteMany({
      where: { ownerId: parseInt(ownerId) },
    });

    // Create new weekly slots
    const slotsToCreate = weeklySlots.map((slot: any) => ({
      ownerId: parseInt(ownerId),
      dayOfWeek: slot.dayOfWeek,
      isEnabled: slot.isEnabled,
      startTime: slot.startTime,
      endTime: slot.endTime,
    }));

    await prisma.weeklySlot.createMany({
      data: slotsToCreate,
    });

    return NextResponse.json({ 
      message: 'Weekly slots updated successfully',
      ownerId: parseInt(ownerId),
      slotsCreated: slotsToCreate.length
    });
  } catch (error) {
    console.error('Error updating weekly slots:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET method remains the same
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get('ownerId');

    if (!ownerId) {
      return NextResponse.json(
        { error: 'Owner ID is required' },
        { status: 400 }
      );
    }

    const weeklySlots = await prisma.weeklySlot.findMany({
      where: { ownerId: parseInt(ownerId) },
      orderBy: { dayOfWeek: 'asc' },
    });

    return NextResponse.json(weeklySlots);
  } catch (error) {
    console.error('Error fetching weekly slots:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}