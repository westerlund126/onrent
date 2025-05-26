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

  const q = req.nextUrl.searchParams.get('q')?.trim() || '';
  if (!q) return NextResponse.json([]);

  const customer = await prisma.user.findFirst({
    where: {
      role: 'CUSTOMER',
      username: { equals: q, mode: 'insensitive' },
    },
    select: { id: true, username: true},
  });

  return NextResponse.json(customer ? [customer] : []);
}


