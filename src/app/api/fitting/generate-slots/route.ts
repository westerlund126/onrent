// app/api/fitting/generate-slots/route.ts 
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { userId: callerClerkId } = await auth();

    if (!callerClerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { startDate, endDate } = await request.json(); 

    const caller = await prisma.user.findUnique({
      where: { clerkUserId: callerClerkId },
      select: { id: true, role: true },
    });

    if (!caller) {
      return NextResponse.json({ error: 'Caller not found' }, { status: 404 });
    }

    // Verify owner role
    if (!caller || caller.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Forbidden - Owner access required' },
        { status: 403 },
      );
    }

    const weeklySlots = await prisma.weeklySlot.findMany({
      where: { ownerId: caller.id, isEnabled: true },
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

    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      const weeklySlot = weeklySlots.find(slot => slot.dayOfWeek === dayOfWeek);
      
      if (weeklySlot) {
        const [startHour, startMinute] = weeklySlot.startTime.split(':').map(Number);
        const [endHour, endMinute] = weeklySlot.endTime.split(':').map(Number);
        
        for (let hour = startHour; hour < endHour; hour++) {
          const slotDateTime = new Date(date);
          slotDateTime.setHours(hour, 0, 0, 0);
          
          const existingSlot = await prisma.fittingSlot.findFirst({
            where: {
              ownerId: caller.id,
              dateTime: slotDateTime,
            },
          });
          
          if (!existingSlot) {
            slotsToCreate.push({
              ownerId: caller.id,
              dateTime: slotDateTime,
              isAutoConfirm: true,
            });
          }
        }
      }
    }

    const createdSlots = await prisma.fittingSlot.createMany({
      data: slotsToCreate,
      skipDuplicates: true,
    });

    return NextResponse.json({
      message: `Generated ${createdSlots.count} fitting slots`,
      count: createdSlots.count,
      ownerId: caller.id,
      dateRange: {
        start: startDate,
        end: endDate,
      },
    });
  } catch (error) {
    console.error('Error generating slots:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}