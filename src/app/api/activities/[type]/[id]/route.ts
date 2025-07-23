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

    const { type, id } = await params;
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
              phone_numbers: true,
              email: true
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
          }
        }
      });

      if (!rental) {
        return NextResponse.json({ error: 'Rental not found' }, { status: 404 });
      }

      // Transform to match frontend expectations
      activityDetail = {
        id: rental.id,
        rentalCode: rental.rentalCode,
        status: rental.status,
        startDate: rental.startDate.toISOString(),
        endDate: rental.endDate.toISOString(),
        additionalInfo: rental.additionalInfo,
        createdAt: rental.createdAt.toISOString(),
        updatedAt: rental.updatedAt.toISOString(),
        owner: {
          id: rental.owner.id,
          first_name: rental.owner.first_name,
          last_name: rental.owner.last_name,
          businessName: rental.owner.businessName,
          email: rental.owner.email,
          phone_numbers: rental.owner.phone_numbers,
          businessAddress: rental.owner.businessAddress
        },
        rentalItems: rental.rentalItems.map(item => ({
          id: item.id,
          variantProduct: {
            id: item.variantProduct.id,
            sku: item.variantProduct.sku,
            size: item.variantProduct.size,
            color: item.variantProduct.color,
            price: item.variantProduct.price,
            bustlength: item.variantProduct.bustlength,
            waistlength: item.variantProduct.waistlength,
            length: item.variantProduct.length,
            products: item.variantProduct.products
          }
        }))
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
                  phone_numbers: true,
                  email: true,
                  businessBio: true,
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

      // Transform to match frontend expectations
      activityDetail = {
        id: fitting.id,
        status: fitting.status,
        duration: fitting.duration,
        note: fitting.note,
        tfProofUrl: fitting.tfProofUrl,
        createdAt: fitting.createdAt.toISOString(),
        updatedAt: fitting.updatedAt.toISOString(),
        fittingSlot: {
          id: fitting.fittingSlot.id,
          dateTime: fitting.fittingSlot.dateTime.toISOString(),
          duration: fitting.duration, // Use fitting duration, not slot duration
          owner: {
            id: fitting.fittingSlot.owner.id,
            first_name: fitting.fittingSlot.owner.first_name,
            last_name: fitting.fittingSlot.owner.last_name,
            businessName: fitting.fittingSlot.owner.businessName,
            email: fitting.fittingSlot.owner.email,
            phone_numbers: fitting.fittingSlot.owner.phone_numbers,
            businessAddress: fitting.fittingSlot.owner.businessAddress,
            businessBio: fitting.fittingSlot.owner.businessBio,
          }
        },
        FittingProduct: fitting.FittingProduct.map(fp => ({
          id: fp.id,
          product: fp.variantProduct.products,
          variantProduct: fp.variantProduct ? {
            id: fp.variantProduct.id,
            sku: fp.variantProduct.sku,
            size: fp.variantProduct.size,
            color: fp.variantProduct.color,
            price: fp.variantProduct.price,
            bustlength: fp.variantProduct.bustlength,
            waistlength: fp.variantProduct.waistlength,
            length: fp.variantProduct.length
          } : null
        }))
      };

    } else {
      return NextResponse.json({ error: 'Invalid activity type' }, { status: 400 });
    }

    // Return data in the format expected by frontend
    return NextResponse.json({ data: activityDetail });

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