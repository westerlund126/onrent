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

    if (isNaN(ownerId)) {
      return NextResponse.json({ error: 'Invalid owner ID' }, { status: 400 });
    }

    // Fetch owner details
    const owner = await prisma.user.findUnique({
      where: { 
        id: ownerId,
        role: 'OWNER'
      },
      select: {
        id: true,
        username: true,
        email: true,
        businessName: true,
        businessAddress: true,
        imageUrl: true,
        phone_numbers: true,
        role: true,
      }
    });

    if (!owner) {
      return NextResponse.json({ error: 'Owner not found' }, { status: 404 });
    }

    return NextResponse.json(owner);
  } catch (error) {
    console.error('Error fetching owner:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}