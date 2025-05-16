// app/api/products/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateSku } from 'lib/sku';

const prisma = new PrismaClient();

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
  console.log('POST /api/products called');

  try {
    const body = await req.json();
    const { name, category, images, ownerId, description, variants } = body;

    // Track count per size to increment SKUs correctly
    const sizeCountMap: Record<string, number> = {};

    const processedVariants = variants.map((v: any) => {
      const size = v.size ?? 'X';

      // Count how many of this size we've seen so far
      sizeCountMap[size] = (sizeCountMap[size] || 0) + 1;

      const sku = generateSku({
        category,
        size,
        sequence: sizeCountMap[size],
      });

      return {
        sku,
        size,
        color: v.color,
        price: v.price,
        isRented: v.isRented ?? false,
        isAvailable: v.isAvailable ?? true,
        bustlength: v.bustlength,
        waistlength: v.waistlength,
        length: v.length,
      };
    });

    const newProduct = await prisma.products.create({
      data: {
        name,
        category,
        images,
        ownerId,
        description,
        VariantProducts: {
          create: processedVariants,
        },
      },
      include: {
        VariantProducts: true,
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Failed to create product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 },
    );
  }
}
