// app/api/wishlist/check/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';
const prisma = new PrismaClient();

// GET - Check if product is in user's wishlist
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productsId = searchParams.get('productsId');

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

    const wishlistItem = await prisma.wishlist.findFirst({
      where: {
        userId: user.id,
        productsId: parseInt(productsId)
      }
    });

    return NextResponse.json({ 
      isInWishlist: !!wishlistItem 
    });

  } catch (error) {
    console.error('Error checking wishlist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}