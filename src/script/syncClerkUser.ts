const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

async function syncAllClerkUsers() {
  try {
    let allUsers = [];
    let offset = 0;
    const limit = 100; 
    let hasMore = true;

    while (hasMore) {
      const res = await fetch(
        `https://api.clerk.com/v1/users?limit=${limit}&offset=${offset}`,
        {
          headers: {
            Authorization: `Bearer ${CLERK_SECRET_KEY}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error(`Failed to fetch users from Clerk: ${res.statusText}`);
      }

      const users = await res.json();
      allUsers = allUsers.concat(users);
      
      console.log(`📥 Fetched ${users.length} users (offset: ${offset})`);
      
      hasMore = users.length === limit;
      offset += limit;
    }

    console.log(`📊 Total users fetched from Clerk: ${allUsers.length}`);

    let syncedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const user of allUsers) {
      try {
        const email = user.email_addresses[0]?.email_address;
        const username = user.username;
        const first_name = user.first_name;
        const last_name = user.last_name;

        if (!email) {
          console.log(`⚠️  Skipping user ${user.id} - no email address`);
          skippedCount++;
          continue;
        }

        // Use upsert for cleaner code
        await prisma.user.upsert({
          where: { clerkUserId: user.id },
          update: {
            email,
            first_name,
            last_name,
            username,
            imageUrl: user.image_url,
          },
          create: {
            clerkUserId: user.id,
            email,
            first_name,
            last_name,
            username,
            imageUrl: user.image_url,
          },
        });

        console.log(`✅ Synced user: ${email}`);
        syncedCount++;
      } catch (userError) {
        console.error(`❌ Error processing user ${user.id}:`, userError.message);
        errorCount++;
      }
    }

    console.log(`\n📊 Final Sync Summary:`);
    console.log(`✅ Synced: ${syncedCount} users`);
    console.log(`⚠️  Skipped: ${skippedCount} users`);
    console.log(`❌ Errors: ${errorCount} users`);
    console.log(`📝 Total processed: ${allUsers.length} users from Clerk`);
  } catch (error) {
    console.error('❌ Error syncing users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

syncAllClerkUsers();