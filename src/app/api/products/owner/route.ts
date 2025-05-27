// app/api/products/owner/route.ts
import { auth } from '@clerk/nextjs/server'; 
import { prisma } from 'lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const owner = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true, role: true },
    });

    if (!owner || owner.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Owner account not found' },
        { status: 404 },
      );
    }

    const products = await prisma.products.findMany({
      where: { ownerId: owner.id },
      include: { 
        VariantProducts: true,
        owner: { select: { id: true, username: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(products);
  } catch (err) {
    console.error('Failed to fetch owner products:', err);
    return NextResponse.json(
      { error: 'Failed to fetch owner products' },
      { status: 500 },
    );
  }
}