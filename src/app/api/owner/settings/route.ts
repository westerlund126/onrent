// api/owner/settings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from 'lib/prisma';

export async function GET() {
  try {
    const { userId: callerClerkId } = await auth();
    if (!callerClerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { clerkUserId: callerClerkId },
      select: {
        id: true,
        role: true,
        isAutoConfirm: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (currentUser.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Access denied. Owner role required' },
        { status: 403 },
      );
    }

    return NextResponse.json({
      data: {
        isAutoConfirm: currentUser.isAutoConfirm,
      },
    });
  } catch (err) {
    console.error('[OWNER_SETTINGS_GET]', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId: callerClerkId } = await auth();
    if (!callerClerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { isAutoConfirm } = body;

    if (typeof isAutoConfirm !== 'boolean') {
      return NextResponse.json(
        { error: 'isAutoConfirm must be a boolean' },
        { status: 400 },
      );
    }

    const currentUser = await prisma.user.findUnique({
      where: { clerkUserId: callerClerkId },
      select: {
        id: true,
        role: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (currentUser.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Access denied. Owner role required' },
        { status: 403 },
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: { isAutoConfirm },
      select: {
        isAutoConfirm: true,
      },
    });

    return NextResponse.json({
      data: {
        isAutoConfirm: updatedUser.isAutoConfirm,
      },
    });
  } catch (err) {
    console.error('[OWNER_SETTINGS_PATCH]', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
