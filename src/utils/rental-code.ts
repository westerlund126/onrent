// utils/rental-code.ts
import { prisma } from 'lib/prisma';

function pad(num: number, size = 4) {
  return num.toString().padStart(size, '0');
}

export async function generateRentalCode(): Promise<string> {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `${dateStr}-`; 

  const last = await prisma.rental.findFirst({
    where: { rentalCode: { startsWith: prefix } },
    orderBy: { rentalCode: 'desc' },
    select: { rentalCode: true },
  });

  const nextSeq = last
    ? parseInt(last.rentalCode.slice(prefix.length), 10) + 1
    : 1;
  return `${prefix}${pad(nextSeq)}`;
}
