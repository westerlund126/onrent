// app/api/wishlist/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from 'lib/prisma';
import { auth } from '@clerk/nextjs/server';

// GET - Get user's wishlist
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find user by clerkUserId
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const wishlist = await prisma.wishlist.findMany({
      where: { userId: user.id },
      include: {
        products: {
          include: {
            owner: {
              select: { id: true, username: true }
            },
            VariantProducts: {
              select: { id: true, price: true }
            }
          }
        }
      }
    });

    return NextResponse.json({ wishlist });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Add item to wishlist
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productsId } = await request.json();

    if (!productsId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Find user by clerkUserId
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if product exists
    const product = await prisma.products.findUnique({
      where: { id: productsId }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check if already in wishlist
    const existingWishlistItem = await prisma.wishlist.findFirst({
      where: {
        userId: user.id,
        productsId: productsId
      }
    });

    if (existingWishlistItem) {
      return NextResponse.json({ error: 'Product already in wishlist' }, { status: 409 });
    }

    // Add to wishlist
    const wishlistItem = await prisma.wishlist.create({
      data: {
        userId: user.id,
        productsId: productsId
      }
    });

    return NextResponse.json({ 
      message: 'Product added to wishlist',
      wishlistItem 
    }, { status: 201 });

  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Remove item from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productsId } = await request.json();

    if (!productsId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Find user by clerkUserId  
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find and delete wishlist item
    const deletedItem = await prisma.wishlist.deleteMany({
      where: {
        userId: user.id,
        productsId: productsId
      }
    });

    if (deletedItem.count === 0) {
      return NextResponse.json({ error: 'Wishlist item not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Product removed from wishlist' 
    });

  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

