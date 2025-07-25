// app/api/products/[id]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { skuPrefix, generateSku } from 'utils/sku';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

export async function GET(
  req: Request, 
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    
    const product = await prisma.products.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        VariantProducts: true,
        owner: { 
          select: { 
            id: true, 
            username: true,
            first_name: true,
            last_name: true,
            businessName: true,
            phone_numbers: true,
            imageUrl: true,
            businessAddress: true
          } 
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Get total products count for this owner
    const totalProducts = await prisma.products.count({
      where: { ownerId: product.ownerId }
    });

    // Transform the response to match your frontend interface
    const transformedProduct = {
      ...product,
      owner: {
        ...product.owner,
        firstName: product.owner.first_name,
        lastName: product.owner.last_name,
        totalProducts
      }
    };

    return NextResponse.json(transformedProduct);
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const body = await req.json();
    const { name, category, images, description, variants } = body;

    const currentProduct = await prisma.products.findUnique({
      where: { id: parseInt(params.id) },
      include: { VariantProducts: true }
    });

    if (!currentProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

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

    if (variants && Array.isArray(variants)) {
      const existingVariantIds = currentProduct.VariantProducts.map(v => v.id);
      const providedVariantIds = variants.filter(v => v.id).map(v => v.id);
      const variantsToDelete = existingVariantIds.filter(id => !providedVariantIds.includes(id));

      if (variantsToDelete.length > 0) {
        await prisma.variantProducts.deleteMany({
          where: {
            id: { in: variantsToDelete }
          }
        });
      }

      // Create a cache for SKU generation to avoid duplicate queries
      const prefixSeqCache: Record<string, number> = {};

      // Process each variant
      for (const v of variants) {
        if (v.id) {
          // Update existing variant
          await prisma.variantProducts.update({
            where: { id: v.id },
            data: {
              size: v.size,
              color: v.color,
              price: v.price,
              isRented: v.isRented ?? false,
              isAvailable: v.isAvailable ?? true,
              bustlength: v.bustlength,
              waistlength: v.waistlength,
              length: v.length,
            },
          });
        } else {
          // Create new variant with auto-generated SKU using your existing system
          const size = v.size ?? 'X';
          const prefix = skuPrefix(category || currentProduct.category, size);

          // Use cache to avoid multiple DB queries for same prefix
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
          
          await prisma.variantProducts.create({
            data: {
              sku,
              size: v.size,
              color: v.color,
              price: v.price,
              isRented: v.isRented ?? false,
              isAvailable: v.isAvailable ?? true,
              bustlength: v.bustlength,
              waistlength: v.waistlength,
              length: v.length,
              products: {
                connect: { id: Number(params.id) },
              },
            },
          });
        }
      }
    }

    // Fetch the updated product with variants and owner info
    const productWithVariants = await prisma.products.findUnique({
      where: { id: parseInt(params.id) },
      include: { 
        VariantProducts: true,
        owner: { 
          select: { 
            id: true, 
            username: true,
            first_name: true,
            last_name: true,
            businessName: true,
            phone_numbers: true,
            imageUrl: true,
            businessAddress: true
          } 
        }
      },
    });

    // Get total products count for this owner
    const totalProducts = await prisma.products.count({
      where: { ownerId: productWithVariants?.ownerId }
    });

    // Transform the response
    const transformedProduct = {
      ...productWithVariants,
      owner: {
        ...productWithVariants?.owner,
        firstName: productWithVariants?.owner.first_name,
        lastName: productWithVariants?.owner.last_name,
        totalProducts
      }
    };

    return NextResponse.json(transformedProduct);
  } catch (error) {
    console.error('Failed to update product:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update product',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId },
      select: { id: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const params = await context.params;
    const productId = parseInt(params.id);

    const product = await prisma.products.findUnique({
      where: { id: productId },
      select: { id: true, ownerId: true },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Authorization check
    const isOwner = user.id === product.ownerId;
    const isAdmin = user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: you cannot delete this product' },
        { status: 403 }
      );
    }

    await prisma.fittingProduct.deleteMany({
  where: {
    variantProduct: {
      productsId: productId,
    },
  },
});

await prisma.variantProducts.deleteMany({
  where: { productsId: productId }
});

const deleted = await prisma.products.delete({
  where: { id: productId },
});

    return NextResponse.json({ success: true, deleted });
  } catch (error) {
    console.error('Failed to delete product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
