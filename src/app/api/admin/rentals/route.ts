// app/api/admin/rentals/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from 'lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const admin = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true, role: true },
    });

    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const ownerId = searchParams.get('ownerId');
    
    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const whereClause: any = {};
    if (status) {
      whereClause.status = status;
    }
    if (ownerId) {
      whereClause.ownerId = parseInt(ownerId);
    }

    const [rentals, totalCount] = await Promise.all([
      prisma.rental.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              first_name: true,
              last_name: true,
              phone_numbers: true,
            },
          },
          owner: {
            select: {
              id: true,
              username: true,
              businessName: true,
              first_name: true,
              last_name: true,
              phone_numbers: true,
            },
          },
          rentalItems: {
            include: {
              variantProduct: {
                select: {
                  id: true,
                  sku: true,
                  size: true,
                  color: true,
                  price: true,
                  products: {
                    select: {
                      id: true,
                      name: true,
                      category: true,
                    },
                  },
                  isAvailable: true,
                  isRented: true,
                },
              },
            },
          },
          Tracking: {
            orderBy: { updatedAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.rental.count({
        where: whereClause,
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: rentals,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Get admin rentals error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}