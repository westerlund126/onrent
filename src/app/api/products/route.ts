// app/api/products/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient, UserRole } from '@prisma/client';
import { auth } from '@clerk/nextjs/server'; // ✨ Import Clerk's auth helper
import { generateSku, skuPrefix } from 'utils/sku';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
  const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Find the user in your database to get their role
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 3. Prepare the base query options
    const queryOptions = {
      include: {
        VariantProducts: true,
        owner: { select: { id: true, username: true, businessName: true } },
      },
      where: {}, // Start with an empty where clause
    };

    // 4. If the user is an OWNER, add a condition to the where clause
    if (user.role === UserRole.OWNER) {
      queryOptions.where = { ownerId: user.id };
    }
    
    // For ADMINS or other roles, the where clause remains empty, fetching all products.

    try {
  const products = await prisma.products.findMany(queryOptions);
  return NextResponse.json(products);
} catch (error) {
  console.error("Error fetching products:", error);
  return NextResponse.json({ error: "Failed to fetch products", detail: error.message });
}

  } catch (error) {
    console.error('Failed to fetch products:', error);
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

    if (Array.isArray(body)) {
      const createdProducts = [];
      for (const productData of body) {
        const { name, category, images, ownerId, description, variants } =
          productData;

        if (!variants || !Array.isArray(variants)) {
          return NextResponse.json(
            {
              error:
                'Variants is required and must be an array for each product',
            },
            { status: 400 },
          );
        }
        if (!category) {
          console.error('Category is required for product:', name);
          return NextResponse.json(
            { error: 'Category is required for all products' },
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

    const { name, category, images, ownerId, description, variants } = body;

    if (!variants || !Array.isArray(variants)) {
      return NextResponse.json(
        { error: 'Variants is required and must be an array' },
        { status: 400 },
      );
    }

     if (!category) {
      console.error('Category is required');
      return NextResponse.json(
        { error: 'Category is required' },
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

