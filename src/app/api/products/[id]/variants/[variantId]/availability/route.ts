// app/api/products/[id]/variants/[variantId]/availability/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from 'lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET(
  request: NextRequest,
  context: { params: { variantId: string } },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await Promise.resolve(context.params);
    const variantId = parseInt(params.variantId);

    if (isNaN(variantId)) {
      return NextResponse.json(
        { error: 'Invalid variant ID' },
        { status: 400 },
      );
    }

    const url = new URL(request.url);
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const excludeRentalId = url.searchParams.get('excludeRentalId');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 },
      );
    }

    const variant = await prisma.variantProducts.findUnique({
      where: { id: variantId },
      select: {
        id: true,
        sku: true,
        isAvailable: true,
        isRented: true,
        products: {
          select: {
            ownerId: true,
          },
        },
      },
    });

    if (!variant) {
      return NextResponse.json({ error: 'Variant not found' }, { status: 404 });
    }

    const owner = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true },
    });

    if (!owner || variant.products.ownerId !== owner.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (!variant.isAvailable) {
      return NextResponse.json({
        isAvailable: false,
        reason: 'Variant is not available',
      });
    }

    const conflictWhere: any = {
      variantProductId: variantId,
      rental: {
        OR: [
          {
            startDate: { lte: new Date(startDate) },
            endDate: { gte: new Date(startDate) },
          },
          {
            startDate: { lte: new Date(endDate) },
            endDate: { gte: new Date(endDate) },
          },
          {
            startDate: { gte: new Date(startDate) },
            endDate: { lte: new Date(endDate) },
          },
        ],
        status: { not: 'SELESAI' },
      },
    };

    if (excludeRentalId) {
      const excludeId = parseInt(excludeRentalId);
      if (!isNaN(excludeId)) {
        conflictWhere.rental.id = { not: excludeId };
      }
    }

    const conflict = await prisma.rentalItem.findFirst({
      where: conflictWhere,
      include: {
        rental: {
          select: {
            id: true,
            rentalCode: true,
            startDate: true,
            endDate: true,
            status: true,
          },
        },
      },
    });

    if (conflict) {
      return NextResponse.json({
        isAvailable: false,
        reason: 'Variant is already rented for the selected dates',
        conflictingRental: {
          id: conflict.rental.id,
          code: conflict.rental.rentalCode,
          startDate: conflict.rental.startDate,
          endDate: conflict.rental.endDate,
          status: conflict.rental.status,
        },
      });
    }

    return NextResponse.json({
      isAvailable: true,
      variant: {
        id: variant.id,
        sku: variant.sku,
      },
    });
  } catch (error) {
    console.error('Variant availability check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
