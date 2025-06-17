import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from 'lib/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId: callerClerkId } = await auth();
    if (!callerClerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const rentalId = Number(resolvedParams.id);
    if (Number.isNaN(rentalId)) {
      return NextResponse.json({ error: 'Invalid rental ID' }, { status: 400 });
    }

    const caller = await prisma.user.findUnique({
      where: { clerkUserId: callerClerkId },
      select: { id: true, role: true },
    });
    if (!caller) {
      return NextResponse.json({ error: 'Caller not found' }, { status: 404 });
    }

    const rental = await prisma.rental.findFirst({
      where: {
        id: rentalId,
        ...(caller.role === 'OWNER' && { ownerId: caller.id }),
        ...(caller.role === 'CUSTOMER' && { userId: caller.id }),
      },
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            username: true,
            phone_numbers: true,
            businessAddress: true,
          },
        },
        rentalItems: {
          include: {
            variantProduct: {
              select: {
                id: true,
                sku: true,
                size: true,
                color: true,
                price: true,
                bustlength: true,
                waistlength: true,
                length: true,
                products: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    category: true,
                    images: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!rental) {
      return NextResponse.json({ error: 'Rental not found' }, { status: 404 });
    }

    return NextResponse.json({ data: rental });
  } catch (err) {
    console.error('[RENTAL_DETAIL]', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
