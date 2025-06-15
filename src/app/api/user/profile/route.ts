// app/api/user/profile/route.ts
import { auth } from '@clerk/nextjs/server';
import { prisma } from 'lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: {
        id: true,
        role: true,
        username: true,
        first_name: true,
        last_name: true,
        phone_numbers: true,
        email: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (err) {
    console.error('Failed to fetch user profile:', err);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { first_name, last_name, phone_numbers } = body;

    const updatedUser = await prisma.user.update({
      where: { clerkUserId: userId },
      data: {
        ...(first_name !== undefined && { first_name }),
        ...(last_name !== undefined && { last_name }),
        ...(phone_numbers !== undefined && { phone_numbers }),
      },
      select: {
        id: true,
        role: true,
        username: true,
        first_name: true,
        last_name: true,
        phone_numbers: true,
        email: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (err) {
    console.error('Failed to update user profile:', err);
    return NextResponse.json(
      { error: 'Failed to update user profile' },
      { status: 500 }
    );
  }
}