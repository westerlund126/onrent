import { NextRequest, NextResponse } from 'next/server';
import { prisma } from 'lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access only' }, { status: 403 });
    }

    // Get target user ID
    const userIdToUpdate = parseInt((await params).id, 10);
    if (isNaN(userIdToUpdate)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const { role } = await request.json();

    if (!role || !['CUSTOMER', 'OWNER'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be CUSTOMER or OWNER' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userIdToUpdate },
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (existingUser.role === 'ADMIN') {
      return NextResponse.json(
        { error: 'Cannot change role of admin users' },
        { status: 403 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userIdToUpdate },
      data: { role },
      select: {
        id: true,
        username: true,
        first_name: true,
        last_name: true,
        email: true,
        role: true,
        createdAt: true,
        phone_numbers: true,
        imageUrl: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: 'Failed to update user role' },
      { status: 500 }
    );
  }
}
