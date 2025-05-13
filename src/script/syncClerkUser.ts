const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

async function syncClerkUsers() {
  try {
    const res = await fetch('https://api.clerk.com/v1/users', {
      headers: {
        Authorization: `Bearer ${CLERK_SECRET_KEY}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch users from Clerk: ${res.statusText}`);
    }

    const users = await res.json();

    for (const user of users) {
      const email = user.email_addresses[0]?.email_address;
      const username = user.username;

      await prisma.user.upsert({
        where: { clerkUserId: user.id },
        update: { email, name: username },
        create: {
          clerkUserId: user.id,
          email,
          name: username,
          imageUrl: user.image_url,
        },
      });
    }

    console.log(`✅ Synced ${users.length} users from Clerk.`);
  } catch (error) {
    console.error('❌ Error syncing users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

syncClerkUsers();
