// app/api/admin/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from 'lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { createClerkClient } from '@clerk/nextjs/server';

const cascadeDeleteUser = async (userId: number) => {
  return await prisma.$transaction(
    async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        console.log(`User with id ${userId} not found in database`);
        return null;
      }

      console.log(
        `Starting deletion process for user ${user.id} (${user.clerkUserId})`,
      );

      const deletedFittingProducts = await tx.fittingProduct.deleteMany({
        where: { ownerId: user.id },
      });
      console.log(`Deleted ${deletedFittingProducts.count} fitting products`);

      const userFittingSchedules = await tx.fittingSchedule.deleteMany({
        where: { userId: user.id },
      });
      console.log(
        `Deleted ${userFittingSchedules.count} user fitting schedules`,
      );

      const ownerFittingSchedules = await tx.fittingSchedule.deleteMany({
        where: { ownerId: user.id },
      });
      console.log(
        `Deleted ${ownerFittingSchedules.count} owner fitting schedules`,
      );

      const deletedFittingSlots = await tx.fittingSlot.deleteMany({
        where: { ownerId: user.id },
      });
      console.log(`Deleted ${deletedFittingSlots.count} fitting slots`);

      const deletedWeeklySlots = await tx.weeklySlot.deleteMany({
        where: { ownerId: user.id },
      });
      console.log(`Deleted ${deletedWeeklySlots.count} weekly slots`);

      const deletedScheduleBlocks = await tx.scheduleBlock.deleteMany({
        where: { ownerId: user.id },
      });
      console.log(`Deleted ${deletedScheduleBlocks.count} schedule blocks`);

      const userRentals = await tx.rental.findMany({
        where: { userId: user.id },
        select: { id: true },
      });
      const ownerRentals = await tx.rental.findMany({
        where: { ownerId: user.id },
        select: { id: true },
      });
      const allRentalIds = [
        ...userRentals.map((r) => r.id),
        ...ownerRentals.map((r) => r.id),
      ];

      if (allRentalIds.length > 0) {
        const deletedReturns = await tx.return.deleteMany({
          where: { rentalId: { in: allRentalIds } },
        });
        console.log(`Deleted ${deletedReturns.count} return records`);

        const deletedTracking = await tx.tracking.deleteMany({
          where: { rentalId: { in: allRentalIds } },
        });
        console.log(`Deleted ${deletedTracking.count} tracking records`);

        const deletedRentalItems = await tx.rentalItem.deleteMany({
          where: { rentalId: { in: allRentalIds } },
        });
        console.log(`Deleted ${deletedRentalItems.count} rental items`);
      }

      const deletedUserRentals = await tx.rental.deleteMany({
        where: { userId: user.id },
      });
      console.log(`Deleted ${deletedUserRentals.count} user rentals`);

      const deletedOwnerRentals = await tx.rental.deleteMany({
        where: { ownerId: user.id },
      });
      console.log(`Deleted ${deletedOwnerRentals.count} owner rentals`);

      const userProducts = await tx.products.findMany({
        where: { ownerId: user.id },
        select: { id: true },
      });
      const productIds = userProducts.map((p) => p.id);

      if (productIds.length > 0) {
        const deletedVariantProducts = await tx.variantProducts.deleteMany({
          where: { productsId: { in: productIds } },
        });
        console.log(`Deleted ${deletedVariantProducts.count} variant products`);
      }

      const deletedWishlist = await tx.wishlist.deleteMany({
        where: { userId: user.id },
      });
      console.log(`Deleted ${deletedWishlist.count} wishlist items`);

      const deletedProducts = await tx.products.deleteMany({
        where: { ownerId: user.id },
      });
      console.log(`Deleted ${deletedProducts.count} products`);

      await tx.user.delete({
        where: { id: user.id },
      });

      console.log(
        `User ${user.id} and all related records deleted successfully`,
      );
      return user;
    },
    {
      maxWait: 30000, 
      timeout: 60000, 
    },
  );
};

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth();
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
    const resolvedParams = await params;
    const userIdToDelete = parseInt(resolvedParams.id, 10);
    if (isNaN(userIdToDelete)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 },
      );
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

    let clerkDeleted = false;
    try {
      await clerkClient.users.deleteUser(userToDelete.clerkUserId);
      console.log(`User ${userToDelete.clerkUserId} deleted from Clerk`);
      clerkDeleted = true;
    } catch (clerkError: any) {
      if (clerkError.status === 404) {
        console.log(
          `User ${userToDelete.clerkUserId} was already deleted from Clerk`,
        );
        clerkDeleted = true;
      } else {
        console.error('Error deleting user from Clerk:', clerkError);
        return NextResponse.json(
          { error: 'Failed to delete user from Clerk' },
          { status: 500 },
        );
      }
    }

    if (clerkDeleted) {
      try {
        await cascadeDeleteUser(userIdToDelete);
        console.log(
          `User ${userIdToDelete} and all related records deleted from local database`,
        );
      } catch (dbError) {
        console.error('Error deleting user from local database:', dbError);
        return NextResponse.json(
          { error: 'Failed to delete user from local database' },
          { status: 500 },
        );
      }
    }

    return NextResponse.json(
      {
        message:
          'User and all related records deleted successfully from both Clerk and local database',
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
