import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from "next/server";
import { prisma } from 'lib/prisma';

export async function POST(req: NextRequest) {
  try {
const { userId } = await auth();    
if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - User not authenticated" },
        { status: 401 }
      );
    }

    const { rentalId, rating, comment, products } = await req.json();

    // Validate required fields
    if (!rentalId || !rating || !comment || !products || products.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get internal user ID from Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify rental exists and is completed
    const rental = await prisma.rental.findUnique({
      where: { id: rentalId },
      include: {
        rentalItems: {
          include: {
            variantProduct: {
              select: {
                products: {
                  select: {
                    id: true // Parent product ID
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!rental) {
      return NextResponse.json({ error: 'Rental not found' }, { status: 404 });
    }

    if (rental.status !== 'SELESAI') {
      return NextResponse.json(
        { error: 'Cannot review a rental that hasn\'t been completed' },
        { status: 400 }
      );
    }

    // Check if review already exists for this rental
    const existingReview = await prisma.review.findFirst({
      where: { rentalId },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'Review already exists for this rental' },
        { status: 409 }
      );
    }

    // Get all parent product IDs from rental items
    const rentalParentProductIds = rental.rentalItems.map(
      item => item.variantProduct.products.id
    );

    // Validate that all products belong to the rental
    const invalidProducts = products.filter(
      productId => !rentalParentProductIds.includes(productId)
    );

    if (invalidProducts.length > 0) {
      return NextResponse.json(
        { 
          error: 'Some products do not belong to this rental',
          invalidProducts 
        },
        { status: 400 }
      );
    }

    // Create reviews for each parent product
    const createReviews = products.map(productId => 
      prisma.review.create({
        data: {
          rating,
          comment,
          userId: user.id,
          rentalId,
          productId, // Parent product ID
        }
      })
    );

    const results = await prisma.$transaction(createReviews);

    // Update rental to mark as reviewed
    await prisma.rental.update({
      where: { id: rentalId },
      data: { hasReview: true },
    });

    return NextResponse.json(
      { 
        message: 'Reviews created successfully', 
        count: results.length 
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Error creating reviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}