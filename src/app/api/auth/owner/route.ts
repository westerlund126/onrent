// app/api/auth/owner/route.ts
import { auth } from '@clerk/nextjs/server';
import { prisma } from 'lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const owner = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true, role: true, username: true },
    });

    if (!owner || owner.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Owner account not found' },
        { status: 404 },
      );
    }

    return NextResponse.json(owner);
  } catch (err) {
    console.error('Failed to fetch owner info:', err);
    return NextResponse.json(
      { error: 'Failed to fetch owner info' },
      { status: 500 },
    );
  }
}