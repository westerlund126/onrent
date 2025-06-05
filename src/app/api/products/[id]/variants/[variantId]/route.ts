// app/api/products/[id]/variants/[variantId]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string; variantId: string }> } // Changed: params is now a Promise
) {
  try {
    const params = await context.params; // Changed: directly await params
   
    const variant = await prisma.variantProducts.findUnique({
      where: {
        id: parseInt(params.variantId),
      },
    });

    if (!variant) {
      return NextResponse.json({ error: 'Variant not found' }, { status: 404 });
    }

    return NextResponse.json(variant);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch variant' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string; variantId: string }> } // Changed: params is now a Promise
) {
  try {
    const params = await context.params; // Changed: directly await params
   
    const body = await req.json();
    const { size, color, price, isRented, isAvailable, bustlength, waistlength, length } = body;

    const updatedVariant = await prisma.variantProducts.update({
      where: {
        id: parseInt(params.variantId),
      },
      data: {
        size,
        color,
        price,
        isRented,
        isAvailable,
        bustlength,
        waistlength,
        length,
      },
    });

    return NextResponse.json(updatedVariant);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update variant' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string; variantId: string }> } // Changed: params is now a Promise
) {
  try {
    const params = await context.params; // Changed: directly await params
    const productId = parseInt(params.id);
    const variantId = parseInt(params.variantId);
   
    const variant = await prisma.variantProducts.findFirst({
      where: {
        id: variantId,
        productsId: productId
      }
    });

    if (!variant) {
      return NextResponse.json({
        error: 'Variant not found or does not belong to this product'
      }, { status: 404 });
    }

    // Delete the variant
    const deleted = await prisma.variantProducts.delete({
      where: { id: variantId },
    });

    // Check if this was the last variant for the product
    const remainingVariants = await prisma.variantProducts.count({
      where: { productsId: productId }
    });

    // If no variants remain, delete the product
    if (remainingVariants === 0) {
      await prisma.products.delete({
        where: { id: productId }
      });
     
      return NextResponse.json({
        success: true,
        deleted,
        productDeleted: true,
        message: 'Variant and product deleted as no variants remain'
      });
    }

    // Get updated product with remaining variants
    const updatedProduct = await prisma.products.findUnique({
      where: { id: productId },
      include: {
        VariantProducts: true,
        owner: { select: { id: true, username: true } },
      },
    });

    return NextResponse.json({
      success: true,
      deleted,
      productDeleted: false,
      product: updatedProduct
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete variant' }, { status: 500 });
  }
}