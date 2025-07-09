import { NextRequest, NextResponse } from 'next/server';
import { prisma } from 'lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function DELETE(
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
      return NextResponse.json(
        { error: 'Forbidden - Admin access only' },
        { status: 403 },
      );
    }

    const resolvedParams = await params;
    const userIdToDelete = parseInt(resolvedParams.id, 10);
    if (isNaN(userIdToDelete)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 },
      );
    }

    const userToDelete = await prisma.user.findUnique({
      where: { id: userIdToDelete },
    });

    if (!userToDelete) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (userToDelete.role === 'ADMIN') {
      return NextResponse.json(
        { error: 'Cannot delete an admin account' },
        { status: 403 },
      );
    }

    await prisma.user.delete({
      where: { id: userIdToDelete },
    });

    return NextResponse.json(
      { message: 'User deleted successfully' },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 },
    );
  }
}