// app/api/products/[id]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  req: Request, 
  context: { params: { id: string } }
) {
  try {
    const params = await Promise.resolve(context.params);
    
    const product = await prisma.products.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        VariantProducts: true,
        owner: { select: { id: true, username: true } },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const params = await Promise.resolve(context.params);
    const body = await req.json();
    const { name, category, images, description, variants } = body;

    // Update the product
    const updatedProduct = await prisma.products.update({
      where: { id: parseInt(params.id) },
      data: {
        name,
        category,
        images,
        description,
      },
      include: { VariantProducts: true },
    });

    // Update variants if provided
    if (variants && Array.isArray(variants)) {
      for (const v of variants) {
        await prisma.variantProducts.update({
          where: { id: v.id },
          data: {
            size: v.size,
            color: v.color,
            price: v.price,
            isRented: v.isRented,
            isAvailable: v.isAvailable,
            bustlength: v.bustlength,
            waistlength: v.waistlength,
            length: v.length,
          },
        });
      }
    }

    // Fetch the updated product with variants
    const productWithVariants = await prisma.products.findUnique({
      where: { id: parseInt(params.id) },
      include: { VariantProducts: true },
    });

    return NextResponse.json(productWithVariants);
  } catch (error) {
    console.error('Failed to update product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const params = await Promise.resolve(context.params);
    
    const deleted = await prisma.products.delete({
      where: { id: parseInt(params.id) },
    });
    return NextResponse.json({ success: true, deleted });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}