// api/fitting/schedule/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';
import { EmailService } from 'lib/resend';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const prisma = new PrismaClient();
const emailService = new EmailService();

const formatFittingDate = (date: Date) => {
  return format(date, "EEEE, d MMMM yyyy 'pukul' HH:mm", { locale: id });
};

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const {
      fittingSlotId,
      duration = 60,
      note,
      variantIds = [],
      tfProofUrl,
      phoneNumber,
    } = await request.json();

    if (!fittingSlotId) {
      return NextResponse.json(
        { error: 'Fitting slot ID is required' },
        { status: 400 },
      );
    }

    if (phoneNumber && phoneNumber !== user.phone_numbers) {
  await prisma.user.update({
    where: { id: user.id },
    data: { phone_numbers: phoneNumber },
  });
}

    const variantIdsNumeric: number[] = Array.from(
      new Set(
        variantIds.map((id: any) => parseInt(id)).filter((id) => !isNaN(id))
      ),
    );


    const fittingSlot = await prisma.fittingSlot.findUnique({
      where: { id: parseInt(fittingSlotId) },
      include: {
        owner: {
          select: {
            id: true,
            clerkUserId: true,
            email: true,
            first_name: true,
            last_name: true,
            businessName: true,
          },
        },
      },
    });

    if (!fittingSlot) {
      return NextResponse.json(
        { error: 'Fitting slot not found' },
        { status: 404 },
      );
    }

    if (fittingSlot.isBooked) {
      return NextResponse.json(
        { error: 'Fitting slot is already booked' },
        { status: 400 },
      );
    }

    let existingVariants: any[] = [];
    if (variantIdsNumeric.length > 0) {
      existingVariants = await prisma.variantProducts.findMany({
        where: { id: { in: variantIdsNumeric } },
        include: {
          products: {
            select: {
              id: true,
              name: true,
              ownerId: true,
            },
          },
        },
      });

      if (existingVariants.length !== variantIdsNumeric.length) {
        const missingIds = variantIdsNumeric.filter(
          (id) => !existingVariants.some((v) => v.id === id),
        );
        return NextResponse.json(
          { error: `Variants not found: ${missingIds.join(', ')} ` },
          { status: 400 },
        );
      }
    }

    const initialStatus = 'PENDING';

    const result = await prisma.$transaction(async (tx) => {
      const activeSchedule = await tx.fittingSchedule.findFirst({
        where: {
          fittingSlotId: parseInt(fittingSlotId),
          isActive: true,
        },
      });

      if (activeSchedule) {
        throw new Error('Fitting slot is already booked');
      }

      const fittingSchedule = await tx.fittingSchedule.create({
        data: {
          userId: user.id,
          ownerId: fittingSlot.owner.id,
          fittingSlotId: parseInt(fittingSlotId),
          duration,
          note,
          status: initialStatus,
          tfProofUrl,
          isActive: true,
        },
      });

      await tx.fittingSlot.update({
        where: { id: parseInt(fittingSlotId) },
        data: { isBooked: true },
      });

      // Create fitting products
      if (variantIdsNumeric.length > 0) {
        await Promise.all(
          variantIdsNumeric.map((variantId) =>
            tx.fittingProduct.create({
              data: {
                fittingId: fittingSchedule.id,
                variantProductId: variantId,
                ownerId: fittingSlot.owner.id,
              },
            })
          )
        );
      }

      return fittingSchedule.id;
    });

    const completeSchedule = await prisma.fittingSchedule.findUnique({
      where: { id: result },
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            username: true,
            email: true,
            phone_numbers: true,
          },
        },
        fittingSlot: {
          include: {
            owner: {
              select: {
                id: true,
                clerkUserId: true,
                businessName: true,
                businessAddress: true,
                phone_numbers: true,
                businessBio: true,
                email: true,
                first_name: true,
                last_name: true,
              },
            },
          },
        },
        FittingProduct: {
          include: {
            variantProduct: {
              select: {
                id: true,
                size: true,
                color: true,
                sku: true,
                products: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (completeSchedule) {
      try {
        // Format the fitting date
        const formattedFittingDate = formatFittingDate(
          completeSchedule.fittingSlot.dateTime
        );
        
        // Get product names
        const productNames = completeSchedule.FittingProduct.map(
          (fp) => fp.variantProduct.products.name
        );
        
        // Get customer name
        const customerName =
          `${completeSchedule.user.first_name || ''} ${
            completeSchedule.user.last_name || ''
          }`.trim() || completeSchedule.user.username || 'Customer';

        // Get owner name
        const ownerName = 
          completeSchedule.fittingSlot.owner.businessName ||
          `${completeSchedule.fittingSlot.owner.first_name} ${
            completeSchedule.fittingSlot.owner.last_name || ''
          }`.trim();

        // Send email to owner
        await emailService.notifyOwnerNewFitting({
          ownerEmail: completeSchedule.fittingSlot.owner.email,
          ownerName,
          customerName,
          customerEmail: completeSchedule.user.email,
          customerPhone: completeSchedule.user.phone_numbers || undefined,
          fittingDate: formattedFittingDate,
          fittingId: completeSchedule.id,
          productNames,
          note: completeSchedule.note || undefined,
          businessName: completeSchedule.fittingSlot.owner.businessName || undefined,
        });
      } catch (emailError) {
        console.error('Failed to send owner notification email:', emailError);
      }
    }

    return NextResponse.json({
      message: 'Fitting scheduled - pending confirmation',
      schedule: completeSchedule,
      status: initialStatus,
    });
  } catch (error: any) {
    console.error('Error creating fitting schedule:', error);
    const status = error.message.includes('not found') ? 404 : 500;
    return NextResponse.json(
      {
        error: 'Error creating fitting schedule',
        details: error.message,
      },
      { status },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId: callerClerkId } = await auth();

    if (!callerClerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const caller = await prisma.user.findUnique({
      where: { clerkUserId: callerClerkId },
      select: { id: true, role: true },
    });

    if (!caller) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const ownerIdParam = searchParams.get('ownerId');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const status = searchParams.get('status');
    const includeInactive = searchParams.get('includeInactive') === 'true';

    let whereClause: any = {};

    if (caller.role === 'CUSTOMER') {
      whereClause.userId = caller.id;
    } else if (caller.role === 'OWNER') {
      if (ownerIdParam) {
        const requestedOwnerId = parseInt(ownerIdParam);
        if (requestedOwnerId === caller.id) {
          whereClause.ownerId = caller.id;
        } else {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
      } else {
        whereClause.ownerId = caller.id;
      }
    } else if (caller.role === 'ADMIN') {
      if (ownerIdParam) {
        whereClause.ownerId = parseInt(ownerIdParam);
      }
    }

    if (dateFrom || dateTo) {
      whereClause.fittingSlot = {
        ...whereClause.fittingSlot,
        dateTime: {
          ...(dateFrom && { gte: new Date(dateFrom) }),
          ...(dateTo && { lte: new Date(dateTo) }),
        },
      };
    }

    if (!includeInactive && !status) {
      whereClause.isActive = true;
    }

    if (status) {
      whereClause.status = status;
    }

    const schedules = await prisma.fittingSchedule.findMany({
      where: {
        ...whereClause,
      },
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            username: true,
            email: true,
            phone_numbers: true,
          },
        },
        fittingSlot: {
          include: {
            owner: {
              select: {
                id: true,
                clerkUserId: true,
                businessName: true,
                businessAddress: true,
                phone_numbers: true,
                email: true,
                first_name: true,
                last_name: true,
              },
            },
          },
        },
        FittingProduct: {
          include: {
            variantProduct: {
              select: {
                id: true,
                size: true,
                color: true,
                sku: true,
                products: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(schedules);
  } catch (error: any) {
    console.error('Error fetching fitting schedules:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 },
    );
  }
}