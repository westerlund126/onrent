// app/api/activities/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
  const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database using clerkUserId
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get URL search params for pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Fetch rentals where user is the customer
    const rentals = await prisma.rental.findMany({
      where: {
        userId: user.id
      },
      include: {
        owner: {
          select: {
            businessName: true,
            first_name: true,
            last_name: true
          }
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
                  products: {
                    select: {
                      id: true,
                      name: true,
                      category: true,
                    },
                  },
                },
              },
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });

    // Fetch fitting schedules where user is the customer
    const fittings = await prisma.fittingSchedule.findMany({
      where: {
        userId: user.id
      },
      include: {
        fittingSlot: {
          include: {
            owner: {
              select: {
                businessName: true,
                first_name: true,
                last_name: true
              }
            }
          }
        },
        FittingProduct: {
  include: {
    variantProduct: {
      include: {
        products: {
          select: {
            name: true
          }
        }
      }
    }
  }
}
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });

    // Transform rentals to activity format
    const rentalActivities = rentals.map(rental => {
      // Calculate total price from rental items
      const totalPrice = rental.rentalItems.reduce((total, item) => {
        return total + (item.variantProduct?.price || 0);
      }, 0);

     // Get product names with variants
  const products = rental.rentalItems.map(item => {
    const productName = item.variantProduct?.products?.name;
    const size = item.variantProduct?.size;
    const color = item.variantProduct?.color;
    
    if (!productName) return null;
    
    return `${productName}${size ? ` (${size}` : ''}${color ? `, ${color})` : size ? ')' : ''}`;
  }).filter(Boolean);

      // Get owner name (business name or full name)
      const ownerName = rental.owner.businessName || 
        `${rental.owner.first_name} ${rental.owner.last_name || ''}`.trim();

      return {
        id: rental.id,
        type: 'rental',
        date: rental.createdAt.toISOString(),
        ownerName,
        products,
        status: rental.status,
        totalPrice,
        rentalCode: rental.rentalCode,
        // Additional data for detail page
        startDate: rental.startDate,
        endDate: rental.endDate,
        additionalInfo: rental.additionalInfo
      };
    });

    // Transform fittings to activity format
    const fittingActivities = fittings.map(fitting => {
      // Get product names from FittingProduct relation
const products = fitting.FittingProduct.map(fp =>
  `${fp.variantProduct.products.name} (${fp.variantProduct.size}${fp.variantProduct.color ? `, ${fp.variantProduct.color}` : ''})`
);
      // Get owner name from fitting slot owner
      const ownerName = fitting.fittingSlot.owner.businessName || 
        `${fitting.fittingSlot.owner.first_name} ${fitting.fittingSlot.owner.last_name || ''}`.trim();

      return {
        id: fitting.id,
        type: 'fitting',
        date: fitting.createdAt.toISOString(),
        ownerName,
        products,
        status: fitting.status,
        totalPrice: null, // Fittings don't have price
        // Additional data for detail page
        duration: fitting.duration,
        note: fitting.note,
        fittingDateTime: fitting.fittingSlot.dateTime
      };
    });

    // Combine and sort activities by date
    const allActivities = [...rentalActivities, ...fittingActivities]
.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Get total count for pagination
    const totalRentals = await prisma.rental.count({
      where: { userId: user.id }
    });
    
    const totalFittings = await prisma.fittingSchedule.count({
      where: { userId: user.id }
    });

    const totalActivities = totalRentals + totalFittings;
    const totalPages = Math.ceil(totalActivities / limit);

    return NextResponse.json({
      activities: allActivities,
      pagination: {
        currentPage: page,
        totalPages,
        totalActivities,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}