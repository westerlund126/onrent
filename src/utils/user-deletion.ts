// lib/user-deletion.ts
import { prisma } from 'lib/prisma';
import { PrismaClient } from '@prisma/client';

export interface DeletionSummary {
  userId: number;
  clerkUserId: string;
  deletedRecords: {
    fittingProducts: number;
    userFittingSchedules: number;
    ownerFittingSchedules: number;
    fittingSlots: number;
    weeklySlots: number;
    scheduleBlocks: number;
    returns: number;
    tracking: number;
    rentalItems: number;
    userRentals: number;
    ownerRentals: number;
    variantProducts: number;
    wishlistItems: number;
    products: number;
  };
  totalRecordsDeleted: number;
}

export interface DeletionPreview {
  userId: number;
  clerkUserId: string;
  recordsToDelete: {
    fittingProducts: number;
    userFittingSchedules: number;
    ownerFittingSchedules: number;
    fittingSlots: number;
    weeklySlots: number;
    scheduleBlocks: number;
    returns: number;
    tracking: number;
    rentalItems: number;
    userRentals: number;
    ownerRentals: number;
    variantProducts: number;
    wishlistItems: number;
    products: number;
  };
  totalRecordsToDelete: number;
}

export const cascadeDeleteUserWithSummary = async (
  userId: number,
  tx?: PrismaClient,
): Promise<DeletionSummary | null> => {
  const client = tx || prisma;

  const executeTransaction = async (transactionClient: any) => {
    // Find the user first
    const user = await transactionClient.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.log(`User with id ${userId} not found in database`);
      return null;
    }

    console.log(
      `Starting deletion process for user ${user.id} (${user.clerkUserId})`,
    );

    const deletionSummary: DeletionSummary = {
      userId: user.id,
      clerkUserId: user.clerkUserId,
      deletedRecords: {
        fittingProducts: 0,
        userFittingSchedules: 0,
        ownerFittingSchedules: 0,
        fittingSlots: 0,
        weeklySlots: 0,
        scheduleBlocks: 0,
        returns: 0,
        tracking: 0,
        rentalItems: 0,
        userRentals: 0,
        ownerRentals: 0,
        variantProducts: 0,
        wishlistItems: 0,
        products: 0,
      },
      totalRecordsDeleted: 0,
    };

    // 1. Delete FittingProduct records
    const deletedFittingProducts =
      await transactionClient.fittingProduct.deleteMany({
        where: { ownerId: user.id },
      });
    deletionSummary.deletedRecords.fittingProducts =
      deletedFittingProducts.count;

    // 2. Delete FittingSchedule records
    const userFittingSchedules =
      await transactionClient.fittingSchedule.deleteMany({
        where: { userId: user.id },
      });
    deletionSummary.deletedRecords.userFittingSchedules =
      userFittingSchedules.count;

    const ownerFittingSchedules =
      await transactionClient.fittingSchedule.deleteMany({
        where: { ownerId: user.id },
      });
    deletionSummary.deletedRecords.ownerFittingSchedules =
      ownerFittingSchedules.count;

    // 3. Delete FittingSlot records
    const deletedFittingSlots = await transactionClient.fittingSlot.deleteMany({
      where: { ownerId: user.id },
    });
    deletionSummary.deletedRecords.fittingSlots = deletedFittingSlots.count;

    // 4. Delete WeeklySlot records
    const deletedWeeklySlots = await transactionClient.weeklySlot.deleteMany({
      where: { ownerId: user.id },
    });
    deletionSummary.deletedRecords.weeklySlots = deletedWeeklySlots.count;

    // 5. Delete ScheduleBlock records
    const deletedScheduleBlocks =
      await transactionClient.scheduleBlock.deleteMany({
        where: { ownerId: user.id },
      });
    deletionSummary.deletedRecords.scheduleBlocks = deletedScheduleBlocks.count;

    // 6. Get all rental IDs for this user
    const userRentals = await transactionClient.rental.findMany({
      where: { userId: user.id },
      select: { id: true },
    });
    const ownerRentals = await transactionClient.rental.findMany({
      where: { ownerId: user.id },
      select: { id: true },
    });
    const allRentalIds = [
      ...userRentals.map((r) => r.id),
      ...ownerRentals.map((r) => r.id),
    ];

    if (allRentalIds.length > 0) {
      // Delete Return records
      const deletedReturns = await transactionClient.return.deleteMany({
        where: { rentalId: { in: allRentalIds } },
      });
      deletionSummary.deletedRecords.returns = deletedReturns.count;

      // Delete Tracking records
      const deletedTracking = await transactionClient.tracking.deleteMany({
        where: { rentalId: { in: allRentalIds } },
      });
      deletionSummary.deletedRecords.tracking = deletedTracking.count;

      // Delete RentalItem records
      const deletedRentalItems = await transactionClient.rentalItem.deleteMany({
        where: { rentalId: { in: allRentalIds } },
      });
      deletionSummary.deletedRecords.rentalItems = deletedRentalItems.count;
    }

    // 7. Delete Rental records
    const deletedUserRentals = await transactionClient.rental.deleteMany({
      where: { userId: user.id },
    });
    deletionSummary.deletedRecords.userRentals = deletedUserRentals.count;

    const deletedOwnerRentals = await transactionClient.rental.deleteMany({
      where: { ownerId: user.id },
    });
    deletionSummary.deletedRecords.ownerRentals = deletedOwnerRentals.count;

    // 8. Delete VariantProducts for user's products
    const userProducts = await transactionClient.products.findMany({
      where: { ownerId: user.id },
      select: { id: true },
    });
    const productIds = userProducts.map((p) => p.id);

    if (productIds.length > 0) {
      const deletedVariantProducts =
        await transactionClient.variantProducts.deleteMany({
          where: { productsId: { in: productIds } },
        });
      deletionSummary.deletedRecords.variantProducts =
        deletedVariantProducts.count;
    }

    // 9. Delete Wishlist records
    const deletedWishlist = await transactionClient.wishlist.deleteMany({
      where: { userId: user.id },
    });
    deletionSummary.deletedRecords.wishlistItems = deletedWishlist.count;

    // 10. Delete Products records
    const deletedProducts = await transactionClient.products.deleteMany({
      where: { ownerId: user.id },
    });
    deletionSummary.deletedRecords.products = deletedProducts.count;

    // 11. Finally delete the user
    await transactionClient.user.delete({
      where: { id: user.id },
    });

    // Calculate total records deleted
    deletionSummary.totalRecordsDeleted = Object.values(
      deletionSummary.deletedRecords,
    ).reduce(
      (sum, count) => sum + count,
      1, // +1 for the user record itself
    );

    console.log(
      `Deletion summary for user ${user.clerkUserId}:`,
      deletionSummary,
    );
    return deletionSummary;
  };

  if (tx) {
    // If transaction is provided, use it directly
    return await executeTransaction(tx);
  } else {
    // If no transaction provided, create one
    return await prisma.$transaction(executeTransaction, {
      maxWait: 30000, // 30 seconds max wait
      timeout: 60000, // 60 seconds timeout
    });
  }
};

// Utility function to check what records would be deleted (dry run)
export const previewUserDeletion = async (
  userId: number,
): Promise<DeletionPreview | null> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return null;
  }

  // Get all rental IDs for this user to count related records
  const userRentals = await prisma.rental.findMany({
    where: { userId: user.id },
    select: { id: true },
  });
  const ownerRentals = await prisma.rental.findMany({
    where: { ownerId: user.id },
    select: { id: true },
  });
  const allRentalIds = [
    ...userRentals.map((r) => r.id),
    ...ownerRentals.map((r) => r.id),
  ];

  // Get product IDs for variant products count
  const userProducts = await prisma.products.findMany({
    where: { ownerId: user.id },
    select: { id: true },
  });
  const productIds = userProducts.map((p) => p.id);

  // Count records that would be deleted
  const counts = await Promise.all([
    prisma.fittingProduct.count({ where: { ownerId: user.id } }),
    prisma.fittingSchedule.count({ where: { userId: user.id } }),
    prisma.fittingSchedule.count({ where: { ownerId: user.id } }),
    prisma.fittingSlot.count({ where: { ownerId: user.id } }),
    prisma.weeklySlot.count({ where: { ownerId: user.id } }),
    prisma.scheduleBlock.count({ where: { ownerId: user.id } }),
    allRentalIds.length > 0
      ? prisma.return.count({ where: { rentalId: { in: allRentalIds } } })
      : Promise.resolve(0),
    allRentalIds.length > 0
      ? prisma.tracking.count({ where: { rentalId: { in: allRentalIds } } })
      : Promise.resolve(0),
    allRentalIds.length > 0
      ? prisma.rentalItem.count({ where: { rentalId: { in: allRentalIds } } })
      : Promise.resolve(0),
    prisma.rental.count({ where: { userId: user.id } }),
    prisma.rental.count({ where: { ownerId: user.id } }),
    productIds.length > 0
      ? prisma.variantProducts.count({
          where: { productsId: { in: productIds } },
        })
      : Promise.resolve(0),
    prisma.wishlist.count({ where: { userId: user.id } }),
    prisma.products.count({ where: { ownerId: user.id } }),
  ]);

  const [
    fittingProducts,
    userFittingSchedules,
    ownerFittingSchedules,
    fittingSlots,
    weeklySlots,
    scheduleBlocks,
    returns,
    tracking,
    rentalItems,
    userRentalsCount,
    ownerRentalsCount,
    variantProducts,
    wishlistItems,
    products,
  ] = counts;

  const recordsToDelete = {
    fittingProducts,
    userFittingSchedules,
    ownerFittingSchedules,
    fittingSlots,
    weeklySlots,
    scheduleBlocks,
    returns,
    tracking,
    rentalItems,
    userRentals: userRentalsCount,
    ownerRentals: ownerRentalsCount,
    variantProducts,
    wishlistItems,
    products,
  };

  const totalRecordsToDelete = Object.values(recordsToDelete).reduce(
    (sum, count) => sum + count,
    1, // +1 for the user record itself
  );

  return {
    userId: user.id,
    clerkUserId: user.clerkUserId,
    recordsToDelete,
    totalRecordsToDelete,
  };
};

// Utility function to check if a user exists
export const checkUserExists = async (userId: number): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  return !!user;
};

// Utility function to get user info before deletion
export const getUserInfo = async (userId: number) => {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      clerkUserId: true,
      email: true,
      first_name: true,
      last_name: true,
      role: true,
      createdAt: true,
    },
  });
};
