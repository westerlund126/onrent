const { PrismaClient, UserRole } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding started...');

  const adminExists = await prisma.user.findFirst({
    where: { role: 'OWNER' },
  });

  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('pur123456', 10);

    await prisma.user.create({
      data: {
        name: 'Pur',
        email: 'pur@gmail.com',
        password: hashedPassword,
        role: UserRole.OWNER,
        phone: '08123456722',
      },
    });

    console.log('✅ Owner user created!');
  } else {
    console.log('ℹ  Owner already exists. Skipping...');
  }
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
