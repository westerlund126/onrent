// app/api/user/phone/route.ts
import { auth } from '@clerk/nextjs/server';
import { prisma } from 'lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        clerkUserId: userId,
      },
      select: {
        phone_numbers: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ phoneNumber: user.phone_numbers });
  } catch (error) {
    console.error('Error fetching phone number:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { phoneNumber } = body;

    // Basic validation
    if (phoneNumber && typeof phoneNumber !== 'string') {
      return NextResponse.json(
        { error: 'Phone number must be a string' },
        { status: 400 },
      );
    }

    const updatedUser = await prisma.user.update({
      where: {
        clerkUserId: userId,
      },
      data: {
        phone_numbers: phoneNumber || null,
      },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        username: true,
        imageUrl: true,
        phone_numbers: true,
        businessAddress: true,
        businessName: true,
        role: true,
        clerkUserId: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating phone number:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
