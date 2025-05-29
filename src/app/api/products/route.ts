// app/api/products/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { skuPrefix, generateSku } from 'utils/sku';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  console.log('POST /api/products called');
  try {
    const body = await req.json();

    // Check if it's an array of products (bulk creation)
    if (Array.isArray(body)) {
      const createdProducts = [];
      for (const productData of body) {
        const { name, category, images, ownerId, description, variants } =
          productData;

        // Check if variants exists and is an array before processing
        if (!variants || !Array.isArray(variants)) {
          return NextResponse.json(
            {
              error:
                'Variants is required and must be an array for each product',
            },
            { status: 400 },
          );
        }

        const prefixSeqCache: Record<string, number> = {};
        const processedVariants = await Promise.all(
          variants.map(async (v: any) => {
            const size = v.size ?? 'X';
            const prefix = skuPrefix(category, size);

            if (prefixSeqCache[prefix] === undefined) {
              const last = await prisma.variantProducts.findFirst({
                where: { sku: { startsWith: prefix } },
                orderBy: { sku: 'desc' },
                select: { sku: true },
              });
              prefixSeqCache[prefix] = last
                ? Number(last.sku.slice(prefix.length))
                : 0;
            }

            prefixSeqCache[prefix] += 1;
            const sku = generateSku(prefix, prefixSeqCache[prefix]);

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
          }),
        );

        const newProduct = await prisma.products.create({
          data: {
            name,
            category,
            images,
            ownerId,
            description,
            VariantProducts: { create: processedVariants },
          },
          include: { VariantProducts: true },
        });
        createdProducts.push(newProduct);
      }
      return NextResponse.json(createdProducts, { status: 201 });
    }

    // Single product creation
    const { name, category, images, ownerId, description, variants } = body;

    // Check if variants exists and is an array before processing
    if (!variants || !Array.isArray(variants)) {
      return NextResponse.json(
        { error: 'Variants is required and must be an array' },
        { status: 400 },
      );
    }

    const prefixSeqCache: Record<string, number> = {};
    const processedVariants = await Promise.all(
      variants.map(async (v: any) => {
        const size = v.size ?? 'X';
        const prefix = skuPrefix(category, size);

        if (prefixSeqCache[prefix] === undefined) {
          const last = await prisma.variantProducts.findFirst({
            where: { sku: { startsWith: prefix } },
            orderBy: { sku: 'desc' },
            select: { sku: true },
          });
          prefixSeqCache[prefix] = last
            ? Number(last.sku.slice(prefix.length))
            : 0;
        }

        prefixSeqCache[prefix] += 1;
        const sku = generateSku(prefix, prefixSeqCache[prefix]);

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
      }),
    );

    const newProduct = await prisma.products.create({
      data: {
        name,
        category,
        images,
        ownerId,
        description,
        VariantProducts: { create: processedVariants },
      },
      include: { VariantProducts: true },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Failed to create product(s):', error);
    return NextResponse.json(
      { error: 'Failed to create product(s)' },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const products = await prisma.products.findMany({
      include: {
        VariantProducts: true,
        owner: { select: { id: true, username: true } },
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