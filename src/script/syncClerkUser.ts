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
    let syncedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        const email = user.email_addresses[0]?.email_address;
        const username = user.username;
        const first_name = user.first_name;
        const last_name = user.last_name;

        // Skip users without email
        if (!email) {
          console.log(`⚠️  Skipping user ${user.id} - no email address`);
          skippedCount++;
          continue;
        }

        // Check if user already exists by clerkUserId
        const existingUserByClerkId = await prisma.user.findUnique({
          where: { clerkUserId: user.id },
        });

        if (existingUserByClerkId) {
          // Update existing user
          await prisma.user.update({
            where: { clerkUserId: user.id },
            data: {
              email,
              first_name,
              last_name,
              username,
              imageUrl: user.image_url,
            },
          });
          console.log(`✅ Updated user: ${email}`);
          syncedCount++;
        } else {
          // Check if email already exists with different clerkUserId
          const existingUserByEmail = await prisma.user.findUnique({
            where: { email },
          });

          if (existingUserByEmail) {
            // Update the existing user's clerkUserId
            await prisma.user.update({
              where: { email },
              data: {
                clerkUserId: user.id,
                first_name,
                last_name,
                username,
                imageUrl: user.image_url,
              },
            });
            console.log(`✅ Updated existing user's Clerk ID: ${email}`);
            syncedCount++;
          } else {
            // Create new user
            await prisma.user.create({
              data: {
                clerkUserId: user.id,
                email,
                first_name,
                last_name,
                username,
                imageUrl: user.image_url,
              },
            });
            console.log(`✅ Created new user: ${email}`);
            syncedCount++;
          }
        }
      } catch (userError) {
        console.error(
          `❌ Error processing user ${user.id}:`,
          userError.message,
        );
        errorCount++;
      }
    }

    console.log(`\n📊 Sync Summary:`);
    console.log(`✅ Synced: ${syncedCount} users`);
    console.log(`⚠️  Skipped: ${skippedCount} users`);
    console.log(`❌ Errors: ${errorCount} users`);
    console.log(`📝 Total processed: ${users.length} users from Clerk`);
  } catch (error) {
    console.error('❌ Error syncing users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

syncClerkUsers();
