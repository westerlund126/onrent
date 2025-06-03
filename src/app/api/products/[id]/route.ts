// app/api/products/[id]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { skuPrefix, generateSku } from 'utils/sku';

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
        owner: { 
          select: { 
            id: true, 
            username: true, 
            imageUrl: true,
            businessName: true,
            phone_numbers: true
          } 
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Count total products by this owner
    const ownerProductCount = await prisma.products.count({
      where: { ownerId: product.ownerId }
    });

    // Add totalProducts to the owner object
    const productWithOwnerInfo = {
      ...product,
      owner: {
        ...product.owner,
        totalProducts: ownerProductCount
      }
    };

    return NextResponse.json(productWithOwnerInfo);
  } catch (error) {
    console.error('Failed to fetch product:', error);
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

    // First, get the current product to access its name for SKU generation
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

    // Handle variants if provided
    if (variants && Array.isArray(variants)) {
      // Get existing variant IDs to determine which ones to delete
      const existingVariantIds = currentProduct.VariantProducts.map(v => v.id);
      const providedVariantIds = variants.filter(v => v.id).map(v => v.id);
      const variantsToDelete = existingVariantIds.filter(id => !providedVariantIds.includes(id));

      // Delete variants that are no longer present
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
            imageUrl: true,
            businessName: true,
            phone_numbers: true
          } 
        }
      },
    });

    // Count total products by this owner
    const ownerProductCount = await prisma.products.count({
      where: { ownerId: productWithVariants?.ownerId }
    });

    // Add totalProducts to the owner object
    const finalProduct = productWithVariants ? {
      ...productWithVariants,
      owner: {
        ...productWithVariants.owner,
        totalProducts: ownerProductCount
      }
    } : null;

    return NextResponse.json(finalProduct);
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
  context: { params: { id: string } }
) {
  try {
    const params = await Promise.resolve(context.params);
    
    // First, delete all variants associated with the product
    await prisma.variantProducts.deleteMany({
      where: { productsId: parseInt(params.id) }
    });

    // Then delete the product
    const deleted = await prisma.products.delete({
      where: { id: parseInt(params.id) },
    });
    
    return NextResponse.json({ success: true, deleted });
  } catch (error) {
    console.error('Failed to delete product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}