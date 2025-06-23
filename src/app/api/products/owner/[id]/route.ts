// app/api/products/owner/[id]/route.ts
import { prisma } from "lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;    
    const ownerId = parseInt(resolvedParams.id);

    if (isNaN(ownerId)) {
      return NextResponse.json({ error: 'Invalid owner ID' }, { status: 400 });
    }

    // 1. Check if owner exists and has OWNER role
    const owner = await prisma.user.findUnique({
      where: { id: ownerId },
      select: { id: true, role: true },
    });

    if (!owner || owner.role !== 'OWNER') {
      return NextResponse.json({ error: 'Owner not found' }, { status: 404 });
    }

    // 2. Fetch products owned by this owner
    const products = await prisma.products.findMany({
      where: { ownerId: ownerId },
      include: { 
        VariantProducts: {
          select: {
            id: true,
            size: true,
            color: true,
            price: true,
            isAvailable: true,
            isRented: true,
            sku: true,
            bustlength: true,
            waistlength: true,
            length: true,
          }
        },
        owner: { 
          select: { 
            id: true, 
            username: true, 
            businessName: true 
          } 
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching owner products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}