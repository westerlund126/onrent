// app/api/products/[id]/reviews/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Fetch reviews for the product
    const reviews = await prisma.review.findMany({
      where: {
        productId: productId
      },
      include: {
        user: {
          select: {
            first_name: true,
            last_name: true,
            username: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });

    // Get total count for pagination
    const totalReviews = await prisma.review.count({
      where: { productId: productId }
    });

    // Calculate average rating
    const avgRating = await prisma.review.aggregate({
      where: { productId: productId },
      _avg: {
        rating: true
      }
    });

    // Get rating distribution
    const ratingDistribution = await prisma.review.groupBy({
      by: ['rating'],
      where: { productId: productId },
      _count: {
        rating: true
      }
    });

    const totalPages = Math.ceil(totalReviews / limit);

    return NextResponse.json({
      reviews,
      pagination: {
        currentPage: page,
        totalPages,
        totalReviews,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      statistics: {
        averageRating: avgRating._avg.rating || 0,
        totalReviews,
        ratingDistribution: ratingDistribution.reduce((acc, item) => {
          acc[item.rating] = item._count.rating;
          return acc;
        }, {} as Record<number, number>)
      }
    });

  } catch (error) {
    console.error('Error fetching product reviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}