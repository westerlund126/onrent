// src/app/api/products/search/route.ts
// Improved version based on your existing schema

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from 'lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const owner = await prisma.user.findUnique({
      where: { clerkUserId: userId, role: 'OWNER' },
      select: { id: true },
    });
    
    if (!owner) {
      return NextResponse.json({ error: 'Owner not found' }, { status: 404 });
    }

    const searchParams = req.nextUrl.searchParams;
    const q = (searchParams.get('q') || '').trim();
    const limit = parseInt(searchParams.get('limit') || '20');
    
    // Return empty if query is too short (performance improvement)
    if (!q || q.length < 2) {
      return NextResponse.json([]);
    }

    const products = await prisma.products.findMany({
      where: {
        ownerId: owner.id,
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          {
            VariantProducts: {
              some: {
                AND: [
                  { isAvailable: true },
                  {
                    OR: [
                      { sku: { contains: q, mode: 'insensitive' } },
                      { size: { contains: q, mode: 'insensitive' } },
                      { color: { contains: q, mode: 'insensitive' } },
                    ],
                  }
                ],
              },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        VariantProducts: {
          where: { isAvailable: true },
          select: { 
            id: true, 
            sku: true, 
            size: true, 
            color: true 
          },
          orderBy: [
            { sku: 'asc' },
            { size: 'asc' }
          ]
        },
      },
      take: limit,
      orderBy: { name: 'asc' }
    });

    // Filter out products with no available variants
    const productsWithVariants = products.filter(
      product => product.VariantProducts.length > 0
    );

    return NextResponse.json(productsWithVariants);
  } catch (error) {
    console.error('Product search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}