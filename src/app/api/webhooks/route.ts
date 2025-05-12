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
    return await prisma.user.create({
      data: {
        clerkUserId: userData.id,
        email: userData.email_addresses[0].email_address,
        name: userData.username,
        imageUrl: userData.image_url,
      },
    });
  } catch (error) {
    console.error('Error: Failed to store event in the database:', error);
    throw new Error('Failed to store event in the database');
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

    console.log('Verified event:', evt);

    // Handle different event types
    if (evt.type === 'user.created') {
      const { id, email_addresses, username, image_url } = evt.data;

      const newUser = await storeUserInDatabase({
        id,
        email_addresses,
        username,
        image_url,
      });

      return new Response(JSON.stringify(newUser), {
        status: 201,
      });
    } else if (evt.type === 'user.updated') {
      const { id, email_addresses, username, image_url } = evt.data;

      const updatedUser = await prisma.user.update({
        where: { clerkUserId: id },
        data: {
          email: email_addresses[0]?.email_address,
          name: username,
          imageUrl: image_url,
        },
      });

      return new Response(JSON.stringify(updatedUser), {
        status: 200,
      });
    } else if (evt.type === 'user.deleted') {
      const { id } = evt.data;

      await prisma.user.delete({
        where: { clerkUserId: id },
      });

      return new Response('User deleted successfully', {
        status: 200,
      });
    }

    // If the event type is not handled
    return new Response('Webhook received but event type is not handled', {
      status: 200,
    });
  } catch (err) {
    console.error('Error handling webhook:', err);
    return new Response(err.message, { status: 400 });
  }
}
