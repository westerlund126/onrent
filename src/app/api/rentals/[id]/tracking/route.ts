import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from 'lib/prisma';
import { TrackingStatus } from '@prisma/client';

const statusDescription: Record<TrackingStatus, string> = {
  RENTAL_ONGOING: 'Rental dimulai – Produk telah diambil pelanggan',
  RETURN_PENDING: 'Menunggu pengembalian produk',
  RETURNED: 'Produk telah dikembalikan dalam kondisi baik',
  COMPLETED: 'Transaksi selesai',
};

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { userId: callerClerkId } = await auth();
    if (!callerClerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rentalId = Number(params.id);
    if (Number.isNaN(rentalId)) {
      return NextResponse.json({ error: 'Invalid rental ID' }, { status: 400 });
    }

    const caller = await prisma.user.findUnique({
      where: { clerkUserId: callerClerkId },
      select: { id: true, role: true },
    });

    if (!caller) {
      return NextResponse.json({ error: 'Caller not found' }, { status: 404 });
    }

    const rental = await prisma.rental.findFirst({
      where: {
        id: rentalId,
        ...(caller.role === 'OWNER' && { ownerId: caller.id }),
        ...(caller.role === 'CUSTOMER' && { userId: caller.id }),
      },
      select: { id: true },
    });
    if (!rental) {
      return NextResponse.json({ error: 'Rental not found' }, { status: 404 });
    }

    const events = await prisma.tracking.findMany({
      where: { rentalId },
      orderBy: { updatedAt: 'asc' },
      select: { id: true, status: true, updatedAt: true },
    });

    const timeline = events.map((e) => ({
      ...e,
      description: statusDescription[e.status],
    }));

    return NextResponse.json({ data: timeline });
  } catch (err) {
    console.error('[RENTAL_TRACKING]', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
