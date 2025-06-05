import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { prisma } from 'lib/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }, // Changed: params is now a Promise
) {
  try {
    const { userId: callerClerkId } = await auth(); 
    if (!callerClerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Changed: await the params Promise
    const resolvedParams = await params;
    const id = Number(resolvedParams.id);
    
    if (Number.isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid customer ID' },
        { status: 400 },
      );
    }

    const userRow = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        username: true,
        phone_numbers: true,
        businessAddress: true,
        clerkUserId: true,
      },
    });

    if (!userRow) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 },
      );
    }

    const clerk = await clerkClient();
    const clerkProfile = await clerk.users.getUser(userRow.clerkUserId);

    return NextResponse.json({
      data: {
        id: userRow.id,
        first_name: userRow.first_name,
        last_name: userRow.last_name,
        username: userRow.username,
        email: clerkProfile.emailAddresses[0]?.emailAddress ?? null,
        imageUrl: clerkProfile.imageUrl,
        phone_numbers: userRow.phone_numbers,
        businessAddress: userRow.businessAddress,
      },
    });
  } catch (err) {
    console.error('[CUSTOMER_DETAIL]', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}