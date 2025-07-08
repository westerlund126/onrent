// app/api/admin/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from 'lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { createClerkClient } from '@clerk/nextjs/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
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

    const userIdToDelete = parseInt((await params).id, 10);
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

    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    try {
      await clerkClient.users.deleteUser(userToDelete.clerkUserId);
      console.log(`User ${userToDelete.clerkUserId} deleted from Clerk`);
    } catch (clerkError: any) {
      if (clerkError.status === 404) {
        console.log(
          `User ${userToDelete.clerkUserId} was already deleted from Clerk`,
        );
      } else {
        console.error('Error deleting user from Clerk:', clerkError);
        return NextResponse.json(
          { error: 'Failed to delete user from Clerk' },
          { status: 500 },
        );
      }
    }

    try {
      await prisma.$transaction(async (tx) => {
        const localUser = await tx.user.findUnique({
          where: { id: userIdToDelete },
        });

        if (!localUser) {
          console.log(
            `User ${userIdToDelete} already deleted from local database`,
          );
          return;
        }

        await tx.wishlist.deleteMany({
          where: { userId: localUser.id },
        });

        // Add other related table deletions here if needed
        // await tx.orders.deleteMany({ where: { userId: localUser.id } });
        // await tx.reviews.deleteMany({ where: { userId: localUser.id } });
        // await tx.rentals.deleteMany({ where: { userId: localUser.id } });

        // Finally delete the user
        await tx.user.delete({
          where: { id: localUser.id },
        });

        console.log(
          `User ${userIdToDelete} and all related records deleted from local database`,
        );
      });
    } catch (dbError) {
      console.error('Error deleting user from local database:', dbError);
    }

    return NextResponse.json(
      {
        message: 'User deleted successfully from both Clerk and local database',
      },
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
