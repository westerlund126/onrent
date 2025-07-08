import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';
import { prisma } from 'lib/prisma';

const getClerkWebhookSecret = (): string => {
  const secret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
  if (!secret) {
    throw new Error(
      'Error: Please add CLERK_WEBHOOK_SIGNING_SECRET from Clerk Dashboard to .env or .env.local',
    );
  }
  return secret;
};

const getSvixHeaders = async () => {
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    throw new Error('Missing Svix headers');
  }

  return { svix_id, svix_timestamp, svix_signature };
};

const verifyWebhook = async (body: string, headers: Record<string, string>) => {
  const wh = new Webhook(getClerkWebhookSecret());
  try {
    return (await wh.verify(body, headers)) as WebhookEvent;
  } catch (err) {
    console.error('Error: Could not verify webhook:', err);
    throw new Error('Verification error');
  }
};

const storeUserInDatabase = async (userData: any) => {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { clerkUserId: userData.id },
    });

    if (existingUser) {
      console.log(`User ${userData.id} already exists in database`);
      return existingUser;
    }

    return await prisma.user.create({
      data: {
        clerkUserId: userData.id,
        email: userData.email_addresses[0]?.email_address,
        first_name: userData.first_name,
        last_name: userData.last_name,
        username: userData.username,
        imageUrl: userData.image_url,
      },
    });
  } catch (error) {
    console.error('Error: Failed to store user in the database:', error);
    throw new Error('Failed to store user in the database');
  }
};

const updateUserInDatabase = async (userData: any) => {
  try {
    // Check if user exists first
    const existingUser = await prisma.user.findUnique({
      where: { clerkUserId: userData.id },
    });

    if (!existingUser) {
      console.log(
        `User ${userData.id} not found in database for update, creating new user`,
      );
      return await storeUserInDatabase(userData);
    }

    return await prisma.user.update({
      where: { clerkUserId: userData.id },
      data: {
        email: userData.email_addresses[0]?.email_address,
        first_name: userData.first_name,
        last_name: userData.last_name,
        username: userData.username,
        imageUrl: userData.image_url,
      },
    });
  } catch (error) {
    console.error('Error: Failed to update user in the database:', error);
    throw new Error('Failed to update user in the database');
  }
};

const deleteUserFromDatabase = async (clerkUserId: string) => {
  try {
    await prisma.$transaction(
      async (tx) => {
        const user = await tx.user.findUnique({
          where: { clerkUserId },
        });

        if (!user) {
          console.log(
            `User with clerkUserId ${clerkUserId} not found in database`,
          );
          return;
        }

        console.log(
          `Starting deletion process for user ${user.id} (${clerkUserId})`,
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
          console.log(
            `Deleted ${deletedVariantProducts.count} variant products`,
          );
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
          `User ${clerkUserId} and all related records deleted successfully`,
        );
      },
      {
        maxWait: 30000, 
        timeout: 60000,
      },
    );
  } catch (error) {
    console.error('Error: Failed to delete user from database:', error);
    throw new Error('Failed to delete user from database');
  }
};

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const body = JSON.stringify(payload);

    const { svix_id, svix_timestamp, svix_signature } = await getSvixHeaders();

    const evt = await verifyWebhook(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });

    console.log('Verified event:', evt.type, 'for user:', evt.data.id);

    switch (evt.type) {
      case 'user.created': {
        const {
          id,
          email_addresses,
          username,
          image_url,
          first_name,
          last_name,
        } = evt.data;

        const newUser = await storeUserInDatabase({
          id,
          email_addresses,
          username,
          image_url,
          first_name,
          last_name,
        });

        return new Response(JSON.stringify(newUser), {
          status: 201,
        });
      }

      case 'user.updated': {
        const {
          id,
          email_addresses,
          username,
          image_url,
          first_name,
          last_name,
        } = evt.data;

        const updatedUser = await updateUserInDatabase({
          id,
          email_addresses,
          username,
          image_url,
          first_name,
          last_name,
        });

        return new Response(JSON.stringify(updatedUser), {
          status: 200,
        });
      }

      case 'user.deleted': {
        const { id } = evt.data;

        await deleteUserFromDatabase(id);

        return new Response(
          JSON.stringify({
            message: 'User and all related records deleted successfully',
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        );
      }

      default:
        console.log(`Unhandled webhook event type: ${evt.type}`);
        return new Response(
          JSON.stringify({
            message: 'Webhook received but event type is not handled',
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        );
    }
  } catch (err: any) {
    console.error('Error handling webhook:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Unknown error' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}
