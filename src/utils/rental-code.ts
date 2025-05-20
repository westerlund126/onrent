import { prisma } from 'lib/prisma';

function pad(num: number, size: number) {
  return num.toString().padStart(size, '0');
}

async function generateRentalCode(): Promise<string> {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `${dateStr}-`;

  const lastRental = await prisma.rental.findFirst({
    where: {
      rentalCode: { startsWith: prefix },
    },
    orderBy: { rentalCode: 'desc' },
    select: { rentalCode: true },
  });

  let nextNumber = 1;
  if (lastRental?.rentalCode) {
    const lastNumStr = lastRental.rentalCode.slice(prefix.length);
    nextNumber = parseInt(lastNumStr, 10) + 1;
  }

  return `${prefix}${pad(nextNumber, 4)}`;
}
