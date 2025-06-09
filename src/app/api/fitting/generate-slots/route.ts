// app/api/fitting/generate-slots/route.ts - Modified for testing without auth
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { ownerId, startDate, endDate } = await request.json();

    if (!ownerId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Owner ID, start date, and end date are required' },
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

    // Get owner's weekly slots
    const weeklySlots = await prisma.weeklySlot.findMany({
      where: {
        ownerId: parseInt(ownerId),
        isEnabled: true,
      },
    });

    if (weeklySlots.length === 0) {
      return NextResponse.json(
        { error: 'No weekly slots configured for this owner' },
        { status: 400 }
      );
    }

    const slotsToCreate = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Generate slots for each day in the range
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      const weeklySlot = weeklySlots.find(slot => slot.dayOfWeek === dayOfWeek);
      
      if (weeklySlot) {
        const [startHour, startMinute] = weeklySlot.startTime.split(':').map(Number);
        const [endHour, endMinute] = weeklySlot.endTime.split(':').map(Number);
        
        // Generate hourly slots
        for (let hour = startHour; hour < endHour; hour++) {
          const slotDateTime = new Date(date);
          slotDateTime.setHours(hour, 0, 0, 0);
          
          // Check if slot already exists
          const existingSlot = await prisma.fittingSlot.findFirst({
            where: {
              ownerId: parseInt(ownerId),
              dateTime: slotDateTime,
            },
          });
          
          if (!existingSlot) {
            slotsToCreate.push({
              ownerId: parseInt(ownerId),
              dateTime: slotDateTime,
              isAutoConfirm: true,
            });
          }
        }
      }
    }

    // Bulk create slots
    const createdSlots = await prisma.fittingSlot.createMany({
      data: slotsToCreate,
      skipDuplicates: true,
    });

    return NextResponse.json({
      message: `Generated ${createdSlots.count} fitting slots`,
      count: createdSlots.count,
      ownerId: parseInt(ownerId),
      dateRange: {
        start: startDate,
        end: endDate
      }
    });
  } catch (error) {
    console.error('Error generating slots:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}