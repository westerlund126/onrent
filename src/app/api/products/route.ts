// app/api/products/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET all products
export async function GET() {
  try {
    const products = await prisma.products.findMany({
      include: {
        VariantProducts: true,
        owner: { select: { id: true, name: true } },
      },
    });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, category, images, ownerId, description, variants } = body;

    const newProduct = await prisma.products.create({
      data: {
        name,
        category,
        images,
        ownerId,
        description,
        VariantProducts: {
          create: variants.map((v: any) => ({
            size: v.size,
            color: v.color,
            price: v.price,
            isRented: v.isRented ?? false,
            isAvailable: v.isAvailable ?? true,
            bustlength: v.bustlength,
            waistlength: v.waistlength,
            length: v.length,
          })),
        },
      },
      include: {
        VariantProducts: true,
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 },
    );
  }
}
