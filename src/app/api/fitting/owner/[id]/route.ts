//app/api/fitting/owner/[id]
import { prisma } from 'lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId: callerClerkId } = await auth();

    if (!callerClerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const caller = await prisma.user.findUnique({
      where: { clerkUserId: callerClerkId },
      select: { id: true, role: true },
    });

    if (!caller) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const resolvedParams = await params;
    const ownerId = parseInt(resolvedParams.id);

    if (isNaN(ownerId)) {
      return NextResponse.json({ error: 'Invalid owner ID' }, { status: 400 });
    }

    const owner = await prisma.user.findUnique({
      where: { id: ownerId },
      select: {
        id: true,
        businessName: true,
        businessAddress: true,
        phone_numbers: true,
        email: true,
        imageUrl: true,
        role: true,
      },
    });

    if (!owner || owner.role !== 'OWNER') {
      return NextResponse.json({ error: 'Owner not found' }, { status: 404 });
    }

    const { role, ...ownerData } = owner;

    if (caller.role === 'CUSTOMER') {
      return NextResponse.json(ownerData);
    } else if (caller.role === 'OWNER') {
      if (caller.id !== ownerId) {
        return NextResponse.json(
          { error: 'Forbidden - You can only view your own business info' },
          { status: 403 },
        );
      }
      return NextResponse.json(ownerData);
    } else if (caller.role === 'ADMIN') {
      return NextResponse.json(ownerData);
    } else {
      return NextResponse.json({ error: 'Invalid user role' }, { status: 403 });
    }
  } catch (error) {
    console.error('Error fetching owner details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
