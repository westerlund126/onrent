// app/api/fittings/slots/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from 'lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const available = searchParams.get('available') === 'true';
  const ownerId = searchParams.get('ownerId');

  const slots = await prisma.fittingSlot.findMany({
    where: {
      ...(available ? { isBooked: false } : {}),
      ...(ownerId ? { ownerId: parseInt(ownerId) } : {}),
    },
    include: { owner: true },
  });

  return NextResponse.json(slots);
}

export async function POST(req: NextRequest) {
  const { dateTime, isAutoConfirm } = await req.json();
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const owner = await prisma.user.findUnique({
    where: { clerkUserId: userId, role: 'OWNER' },
    select: { id: true },
  });

  if (!owner) {
    return NextResponse.json({ error: 'Owner not found' }, { status: 404 });
  }


  const slot = await prisma.fittingSlot.create({
    data: {
      dateTime: new Date(dateTime),
      isAutoConfirm,
      ownerId: owner.id,
    },
  });

  return NextResponse.json(slot, { status: 201 });
}
