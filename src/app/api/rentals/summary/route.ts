// app/api/rentals/summary/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from 'lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const owner = await prisma.user.findUnique({
    where: { clerkUserId: userId, role: 'OWNER' },
    select: { id: true },
  });
  if (!owner)
    return NextResponse.json({ error: 'Owner only' }, { status: 403 });

  const rows = await prisma.rental.groupBy({
    by: ['status'],
    _count: true,
    where: {
      ownerId: owner.id,
      products: { ownerId: owner.id },
    },
  });

  const stats = {
    LUNAS: 0,
    BELUM_LUNAS: 0,
    TERLAMBAT: 0,
  };
  rows.forEach((r) => {
    if (stats[r.status as keyof typeof stats] !== undefined) {
      stats[r.status as keyof typeof stats] = r._count;
    }
  });

  return NextResponse.json(stats);
}
