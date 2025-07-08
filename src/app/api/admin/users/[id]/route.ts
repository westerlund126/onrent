// app/api/admin/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from 'lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { createClerkClient } from '@clerk/nextjs/server';

// Extract the deletion logic into a reusable function
const cascadeDeleteUser = async (userId: number) => {
  return await prisma.$transaction(
    async (tx) => {
      // Find the user first
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

      // 1. Delete FittingProduct records (has foreign keys to fittingSchedule and variantProduct)
      const deletedFittingProducts = await tx.fittingProduct.deleteMany({
        where: { ownerId: user.id },
      });
      console.log(`Deleted ${deletedFittingProducts.count} fitting products`);

      // 2. Delete FittingSchedule records (has foreign key to fittingSlot)
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

      // 3. Delete FittingSlot records
      const deletedFittingSlots = await tx.fittingSlot.deleteMany({
        where: { ownerId: user.id },
      });
      console.log(`Deleted ${deletedFittingSlots.count} fitting slots`);

      // 4. Delete WeeklySlot records
      const deletedWeeklySlots = await tx.weeklySlot.deleteMany({
        where: { ownerId: user.id },
      });
      console.log(`Deleted ${deletedWeeklySlots.count} weekly slots`);

      // 5. Delete ScheduleBlock records
      const deletedScheduleBlocks = await tx.scheduleBlock.deleteMany({
        where: { ownerId: user.id },
      });
      console.log(`Deleted ${deletedScheduleBlocks.count} schedule blocks`);

      // 6. Delete Return records (connected to rentals)
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

        // 7. Delete Tracking records
        const deletedTracking = await tx.tracking.deleteMany({
          where: { rentalId: { in: allRentalIds } },
        });
        console.log(`Deleted ${deletedTracking.count} tracking records`);

        // 8. Delete RentalItem records
        const deletedRentalItems = await tx.rentalItem.deleteMany({
          where: { rentalId: { in: allRentalIds } },
        });
        console.log(`Deleted ${deletedRentalItems.count} rental items`);
      }

      // 9. Delete Rental records (both as user and owner)
      const deletedUserRentals = await tx.rental.deleteMany({
        where: { userId: user.id },
      });
      console.log(`Deleted ${deletedUserRentals.count} user rentals`);

      const deletedOwnerRentals = await tx.rental.deleteMany({
        where: { ownerId: user.id },
      });
      console.log(`Deleted ${deletedOwnerRentals.count} owner rentals`);

      // 10. Delete VariantProducts (and their related records)
      const userProducts = await tx.products.findMany({
        where: { ownerId: user.id },
        select: { id: true },
      });
      const productIds = userProducts.map((p) => p.id);

      if (productIds.length > 0) {
        // Delete variant products for user's products
        const deletedVariantProducts = await tx.variantProducts.deleteMany({
          where: { productsId: { in: productIds } },
        });
        console.log(`Deleted ${deletedVariantProducts.count} variant products`);
      }

      // 11. Delete Wishlist records
      const deletedWishlist = await tx.wishlist.deleteMany({
        where: { userId: user.id },
      });
      console.log(`Deleted ${deletedWishlist.count} wishlist items`);

      // 12. Delete Products records
      const deletedProducts = await tx.products.deleteMany({
        where: { ownerId: user.id },
      });
      console.log(`Deleted ${deletedProducts.count} products`);

      // 13. Finally delete the user
      await tx.user.delete({
        where: { id: user.id },
      });

      console.log(
        `User ${user.id} and all related records deleted successfully`,
      );
      return user;
    },
    {
      maxWait: 30000, // 30 seconds max wait
      timeout: 60000, // 60 seconds timeout
    },
  );
};

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

    // Initialize Clerk client
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    // Delete from Clerk first - handle case where user might already be deleted
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
