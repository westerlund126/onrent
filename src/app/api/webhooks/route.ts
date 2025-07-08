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
    // Check if user already exists
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
    // Use a transaction to handle all related deletions
    await prisma.$transaction(async (tx) => {
      // Find the user first
      const user = await tx.user.findUnique({
        where: { clerkUserId },
      });

      if (!user) {
        console.log(
          `User with clerkUserId ${clerkUserId} not found in database`,
        );
        return;
      }

      // Delete related records first (based on your schema)
      await tx.wishlist.deleteMany({
        where: { userId: user.id },
      });

      // Add other related table deletions here if needed
      // await tx.orders.deleteMany({ where: { userId: user.id } });
      // await tx.reviews.deleteMany({ where: { userId: user.id } });
      // await tx.rentals.deleteMany({ where: { userId: user.id } });

      // Finally delete the user
      await tx.user.delete({
        where: { id: user.id },
      });

      console.log(
        `User ${clerkUserId} and all related records deleted successfully`,
      );
    });
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

    // Handle different event types
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
            message: 'User and related records deleted successfully',
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
