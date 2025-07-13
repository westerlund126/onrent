// app/api/users/route.ts 
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from 'lib/prisma';


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const rolesParam = searchParams.get('roles');
    const search = searchParams.get('search');
    const limitParam = searchParams.get('limit');
    const pageParam = searchParams.get('page');

    const roles = rolesParam ? rolesParam.split(',') : ['CUSTOMER', 'OWNER'];
    const limit = limitParam ? parseInt(limitParam, 10) : 10;
    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const skip = (page - 1) * limit;

    const whereClause: any = {
      role: {
        in: roles,
      },
    };

    if (search) {
      whereClause.OR = [
        {
          username: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          first_name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          last_name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          email: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    const totalItems = await prisma.user.count({
      where: whereClause,
    });

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        username: true,
        first_name: true,
        last_name: true,
        email: true,
        role: true,
        createdAt: true,
        phone_numbers: true,
        imageUrl: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(totalItems / limit);

    return NextResponse.json({
      users,
      totalItems,
      totalPages,
      currentPage: page,
      limit,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}