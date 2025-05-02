// app/api/products/[id]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface Params {
  params: { id: string };
}

// GET one product by ID
export async function GET(_: Request, { params }: Params) {
  try {
    const product = await prisma.products.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        VariantProducts: true,
        owner: { select: { id: true, name: true } },
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

// PATCH update product info or availability
export async function PATCH(req: Request, { params }: Params) {
  try {
    const body = await req.json();
    const { name, category, images, description, isAvailable, variants } = body;

    const updatedProduct = await prisma.products.update({
      where: { id: parseInt(params.id) },
      data: {
        name,
        category,
        images,
        description,
        VariantProducts: variants
          ? {
              updateMany: variants.map((v: any) => ({
                where: { id: v.id },
                data: {
                  size: v.size,
                  color: v.color,
                  price: v.price,
                  stock: v.stock,
                  availstock: v.availstock,
                  rentedstock: v.rentedstock,
                  isAvailable: v.isAvailable,
                  bustlength: v.bustlength,
                  waistlength: v.waistlength,
                  length: v.length,
                },
              })),
            }
          : undefined,
      },
      include: { VariantProducts: true },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE product
export async function DELETE(_: Request, { params }: Params) {
  try {
    const deleted = await prisma.products.delete({
      where: { id: parseInt(params.id) },
    });
    return NextResponse.json({ success: true, deleted });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
