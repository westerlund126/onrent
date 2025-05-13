// const { PrismaClient } = require('@prisma/client');
// const { seedUsers } = require('./seeds/users.seed');

// const prisma = new PrismaClient();

// async function main() {
//   console.log('🌱 Starting master seed...');
//   await seedUsers();
//   console.log('✅ All seeding completed.');
// }

// main()
//   .catch((e) => {
//     console.error('❌ Master seed failed:', e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
