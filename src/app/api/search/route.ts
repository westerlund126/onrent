// src/app/api/search/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from 'lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const q = (searchParams.get('q') || '').trim();
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 10;
    const skip = (page - 1) * limit;

    if (!q || q.length < 2) {
      return NextResponse.json({
        products: [],
        owners: [],
        totalProducts: 0,
        totalOwners: 0,
        currentPage: page,
        totalPages: 0,
      });
    }

    // Search for products with available variants
    const [products, totalProducts] = await Promise.all([
      prisma.products.findMany({
        where: {
          name: { contains: q, mode: 'insensitive' },
          VariantProducts: {
            some: {
              isAvailable: true,
              isRented: false,
            },
          },
        },
        include: {
          owner: {
            select: {
              id: true,
              businessName: true,
              first_name: true,
              last_name: true,
              imageUrl: true,
            },
          },
          VariantProducts: {
            where: {
              isAvailable: true,
              isRented: false,
            },
            select: {
              id: true,
              price: true,
              size: true,
              color: true,
            },
            take: 1, // Just get one variant for price display
          },
        },
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.products.count({
        where: {
          name: { contains: q, mode: 'insensitive' },
          VariantProducts: {
            some: {
              isAvailable: true,
              isRented: false,
            },
          },
        },
      }),
    ]);

    // Search for owners (business owners with available products)
    const [owners, totalOwners] = await Promise.all([
      prisma.user.findMany({
        where: {
          role: 'OWNER',
          OR: [
            { businessName: { contains: q, mode: 'insensitive' } },
            { first_name: { contains: q, mode: 'insensitive' } },
            { last_name: { contains: q, mode: 'insensitive' } },
          ],
          Products: {
            some: {
              VariantProducts: {
                some: {
                  isAvailable: true,
                  isRented: false,
                },
              },
            },
          },
        },
        select: {
          id: true,
          businessName: true,
          first_name: true,
          last_name: true,
          imageUrl: true,
          businessAddress: true,
          businessBio: true,
          _count: {
            select: {
              Products: {
                where: {
                  VariantProducts: {
                    some: {
                      isAvailable: true,
                      isRented: false,
                    },
                  },
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { businessName: 'asc' },
      }),
      prisma.user.count({
        where: {
          role: 'OWNER',
          OR: [
            { businessName: { contains: q, mode: 'insensitive' } },
            { first_name: { contains: q, mode: 'insensitive' } },
            { last_name: { contains: q, mode: 'insensitive' } },
          ],
          Products: {
            some: {
              VariantProducts: {
                some: {
                  isAvailable: true,
                  isRented: false,
                },
              },
            },
          },
        },
      }),
    ]);

    const totalItems = totalProducts + totalOwners;
    const totalPages = Math.ceil(totalItems / limit);

    return NextResponse.json({
      products,
      owners,
      totalProducts,
      totalOwners,
      currentPage: page,
      totalPages,
      query: q,
    });
  } catch (error) {
    console.error('Global search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}