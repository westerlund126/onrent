const { PrismaClient, UserRole } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding started...');

  const adminExists = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin1234', 10);

    await prisma.user.create({
      data: {
        name: 'Admin1',
        email: 'admin@gmail.com',
        password: hashedPassword,
        role: UserRole.ADMIN,
        phone: '08123456789',
      },
    });

    console.log('✅ Admin user created!');
  } else {
    console.log('ℹ  Admin already exists. Skipping...');
  }
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
