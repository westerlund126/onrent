// app/api/fitting/owner/[id]/route.ts

import { prisma } from "lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
const resolvedParams = await params;    
const ownerId = parseInt(resolvedParams.id);


    const owner = await prisma.user.findUnique({
      where: { id: ownerId },
      select: {
        id: true,
        businessName: true,
        businessAddress: true,
        phone_numbers: true,
        email: true,
        imageUrl: true,
        role: true, // we need this to verify OWNER
      },
    });

    // 2. Check if role is OWNER
    if (!owner || owner.role !== 'OWNER') {
      return NextResponse.json({ error: 'Owner not found' }, { status: 404 });
    }

    // 3. Omit role before returning
    const { role, ...ownerData } = owner;

    return NextResponse.json(ownerData);
  } catch (error) {
    console.error('Error fetching owner details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
