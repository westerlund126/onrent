import { NextRequest, NextResponse } from 'next/server';
import { prisma } from 'lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const schedule = await prisma.fittingSchedule.findUnique({
    where: { id: parseInt(params.id) },
    include: {
      fittingSlot: true,
      user: true,
      FittingProduct: { include: { product: true } },
    },
  });

  if (!schedule) {
    return NextResponse.json(
      { message: 'Schedule not found' },
      { status: 404 },
    );
  }

  return NextResponse.json(schedule);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const { userId: clerkUserId } = await auth();
  const { status } = await req.json();

  if (!clerkUserId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
  });

  if (!user) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }

  const schedule = await prisma.fittingSchedule.findUnique({
    where: { id: parseInt(params.id) },
    include: { fittingSlot: true },
  });

  if (!schedule) {
    return NextResponse.json(
      { message: 'Schedule not found' },
      { status: 404 },
    );
  }

  const isCustomerEditingOwnCancel =
    user.role === 'CUSTOMER' &&
    user.id === schedule.userId &&
    status === 'CANCELED';

  const isOwnerEditingOwnSlot =
    user.role === 'OWNER' && user.id === schedule.fittingSlot?.ownerId;

  if (!isCustomerEditingOwnCancel && !isOwnerEditingOwnSlot) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  const updatedSchedule = await prisma.fittingSchedule.update({
    where: { id: parseInt(params.id) },
    data: { status },
  });

  if (status === 'CANCELED') {
    await prisma.fittingSlot.update({
      where: { id: schedule.fittingSlotId },
      data: { isBooked: false },
    });
  }

  return NextResponse.json(updatedSchedule);
}
