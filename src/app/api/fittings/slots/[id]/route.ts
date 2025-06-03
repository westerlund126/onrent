// app/api/fittings/slots/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from 'lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const slot = await prisma.fittingSlot.findUnique({
    where: { id: parseInt(params.id) },
    include: { owner: true },
  });

  if (!slot) {
    return NextResponse.json({ message: 'Slot not found' }, { status: 404 });
  }

  return NextResponse.json(slot);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
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

  const updatedSlot = await prisma.fittingSlot.update({
    where: { id: parseInt(params.id) },
    data: { dateTime: new Date(dateTime), isAutoConfirm },
  });

  return NextResponse.json(updatedSlot);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
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

  await prisma.fittingSlot.delete({ where: { id: parseInt(params.id) } });
  return NextResponse.json({}, { status: 204 });
}
