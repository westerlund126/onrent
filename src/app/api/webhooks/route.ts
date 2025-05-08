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
        name: userData.first_name,
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
    // Get request payload
    const payload = await req.json();
    const body = JSON.stringify(payload);

    // Get headers and verify
    const { svix_id, svix_timestamp, svix_signature } = await getSvixHeaders();

    // Verify payload with headers
    const evt = await verifyWebhook(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });

    // Handle specific webhook event type
    if (evt.type === 'user.created') {
      const { id, email_addresses, first_name, image_url } = evt.data;
      const newUser = await storeUserInDatabase({
        id,
        email_addresses,
        first_name,
        image_url,
      });

      return new Response(JSON.stringify(newUser), {
        status: 201,
      });
    }

    // If the event type is not handled
    return new Response('Webhook received', { status: 200 });
  } catch (err) {
    console.error('Error handling webhook:', err);
    return new Response(err.message, { status: 400 });
  }
}
