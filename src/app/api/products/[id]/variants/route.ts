// app/api/products/[id]/variants/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from 'lib/prisma';
import { skuPrefix, generateSku } from 'utils/sku';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }, // Changed: params is now a Promise
) {
  try {
    const resolvedParams = await params; // Changed: await the params
    const productId = Number(resolvedParams.id);
   
    const variants = await prisma.variantProducts.findMany({
      where: { productsId: productId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(variants);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Failed to fetch variants' },
      { status: 500 },
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }, // Changed: params is now a Promise
) {
  try {
    const resolvedParams = await params; // Changed: await the params
    const productId = Number(resolvedParams.id);
    const body = await req.json();
    const { size, price, color, ...rest } = body;

    if (!size || !price || !color) {
      return NextResponse.json(
        { error: 'Missing required fields: size, price, or color' },
        { status: 400 },
      );
    }

    const product = await prisma.products.findUnique({
      where: { id: productId },
      select: { category: true },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const currentCount = await prisma.variantProducts.count({
      where: { productsId: productId, size },
    });

    const prefix = skuPrefix(product.category, size);
    const sku = generateSku(prefix, currentCount + 1);

    const variant = await prisma.variantProducts.create({
      data: {
        productsId: productId,
        size,
        color,
        price,
        sku,
        ...rest,
      },
    });

    return NextResponse.json(variant, { status: 201 });
  } catch (err: any) {
    if (err.code === 'P2002') {
      return NextResponse.json(
        { error: 'SKU already exists, retry' },
        { status: 409 },
      );
    }
    console.error('Failed to create variant:', err);
    return NextResponse.json(
      { error: 'Failed to create variant' },
      { status: 500 },
    );
  }
}