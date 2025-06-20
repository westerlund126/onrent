// app/api/activities/[type]/[id]/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
  const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, id } = params;
    const activityId = parseInt(id);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let activityDetail = null;

    if (type === 'rental') {
      const rental = await prisma.rental.findFirst({
        where: {
          id: activityId,
          userId: user.id // Ensure user can only access their own rentals
        },
        include: {
          owner: {
            select: {
              id: true,
              businessName: true,
              first_name: true,
              last_name: true,
              businessAddress: true,
              phone_numbers: true
            }
          },
          rentalItems: {
            include: {
              variantProduct: {
                include: {
                  products: {
                    select: {
                      id: true,
                      name: true,
                      images: true,
                      description: true,
                      category: true
                    }
                  }
                }
              }
            }
          },
          Tracking: {
            orderBy: {
              updatedAt: 'desc'
            }
          },
          Return: true
        }
      });

      if (!rental) {
        return NextResponse.json({ error: 'Rental not found' }, { status: 404 });
      }

      // Calculate total price
      const totalPrice = rental.rentalItems.reduce((total, item) => {
        return total + (item.variantProduct?.price || 0);
      }, 0);

      // Transform rental items with full product details
      const items = rental.rentalItems.map(item => ({
        id: item.id,
        variant: {
          id: item.variantProduct.id,
          size: item.variantProduct.size,
          color: item.variantProduct.color,
          price: item.variantProduct.price,
          sku: item.variantProduct.sku,
          bustlength: item.variantProduct.bustlength,
          waistlength: item.variantProduct.waistlength,
          length: item.variantProduct.length
        },
        product: item.variantProduct.products
      }));

      activityDetail = {
        id: rental.id,
        type: 'rental',
        rentalCode: rental.rentalCode,
        startDate: rental.startDate,
        endDate: rental.endDate,
        status: rental.status,
        additionalInfo: rental.additionalInfo,
        createdAt: rental.createdAt,
        updatedAt: rental.updatedAt,
        totalPrice,
        owner: {
          id: rental.owner.id,
          name: rental.owner.businessName || 
            `${rental.owner.first_name} ${rental.owner.last_name || ''}`.trim(),
          businessAddress: rental.owner.businessAddress,
          phoneNumbers: rental.owner.phone_numbers
        },
        items,
        tracking: rental.Tracking,
        return: rental.Return[0] || null
      };

    } else if (type === 'fitting') {
      const fitting = await prisma.fittingSchedule.findFirst({
        where: {
          id: activityId,
          userId: user.id // Ensure user can only access their own fittings
        },
        include: {
          fittingSlot: {
            include: {
              owner: {
                select: {
                  id: true,
                  businessName: true,
                  first_name: true,
                  last_name: true,
                  businessAddress: true,
                  phone_numbers: true
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
                  id: true,
                  name: true,
                  images: true,
                  description: true,
                  category: true
                }
        }
      }
    }
  }
}
        }
      });

      if (!fitting) {
        return NextResponse.json({ error: 'Fitting not found' }, { status: 404 });
      }

      activityDetail = {
        id: fitting.id,
        type: 'fitting',
        status: fitting.status,
        duration: fitting.duration,
        note: fitting.note,
        createdAt: fitting.createdAt,
        updatedAt: fitting.updatedAt,
        fittingDateTime: fitting.fittingSlot.dateTime,
        isAutoConfirm: fitting.fittingSlot.isAutoConfirm,
        owner: {
          id: fitting.fittingSlot.owner.id,
          name: fitting.fittingSlot.owner.businessName || 
            `${fitting.fittingSlot.owner.first_name} ${fitting.fittingSlot.owner.last_name || ''}`.trim(),
          businessAddress: fitting.fittingSlot.owner.businessAddress,
          phoneNumbers: fitting.fittingSlot.owner.phone_numbers
        },
        products: fitting.FittingProduct.map(fp => fp.variantProduct.products)
      };

    } else {
      return NextResponse.json({ error: 'Invalid activity type' }, { status: 400 });
    }

    return NextResponse.json({ activity: activityDetail });

  } catch (error) {
    console.error('Error fetching activity detail:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}