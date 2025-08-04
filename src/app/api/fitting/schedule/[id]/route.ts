// app/api/fitting/schedule/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from 'lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { EmailService } from 'lib/resend';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const emailService = new EmailService();
const formatFittingDate = (date: Date) => {
  return format(date, "EEEE, d MMMM yyyy 'pukul' HH:mm", { locale: id });
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const resolvedParams = await params;
    const scheduleId = parseInt(resolvedParams.id);

    const schedule = await prisma.fittingSchedule.findUnique({
      where: { id: scheduleId },
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            username: true,
            email: true,
            phone_numbers: true,
            imageUrl: true,
          },
        },
        fittingSlot: {
          include: {
            owner: {
              select: {
                id: true,
                businessName: true,
                businessAddress: true,
                phone_numbers: true,
                businessBio: true,
                email: true,
                imageUrl: true,
                isAutoConfirm: true,
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

    if (!schedule) {
      return NextResponse.json(
        { error: 'Fitting schedule not found' },
        { status: 404 },
      );
    }

    const canAccess =
      caller.role === 'ADMIN' ||
      schedule.userId === caller.id ||
      (caller.role === 'OWNER' && schedule.fittingSlot.ownerId === caller.id);

    if (!canAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json(schedule);
  } catch (error: any) {
    console.error('Error fetching fitting schedule:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 },
    );
  }
}


export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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
    const resolvedParams = await params;
    const scheduleId = parseInt(resolvedParams.id);
    const updates = await request.json();

    // First, get the schedule data for email sending
    const scheduleForEmail = await prisma.fittingSchedule.findUnique({
      where: { id: scheduleId },
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

    if (!scheduleForEmail) {
      return NextResponse.json(
        { error: 'Fitting schedule not found' },
        { status: 404 },
      );
    }

    const canUpdate =
      caller.role === 'ADMIN' ||
      scheduleForEmail.userId === caller.id ||
      (caller.role === 'OWNER' && scheduleForEmail.ownerId === caller.id);

    if (!canUpdate) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if this is a status change that requires email
    const isConfirming = 
      updates.status === 'CONFIRMED' && 
      scheduleForEmail.status !== 'CONFIRMED';

    const isRejecting = 
      updates.status === 'REJECTED' && 
      scheduleForEmail.status !== 'REJECTED';
      
    // Perform database transaction with increased timeout
    const updatedSchedule = await prisma.$transaction(async (tx) => {
      const schedule = await tx.fittingSchedule.findUnique({
        where: { id: scheduleId },
      });

      if (!schedule) {
        throw new Error('Fitting schedule not found');
      }

      const isCancelingOrRejecting =
        (updates.status === 'CANCELED' || updates.status === 'REJECTED') &&
        schedule.status !== 'CANCELED' &&
        schedule.status !== 'REJECTED';

      if (isCancelingOrRejecting) {
        await tx.fittingSchedule.update({
          where: { id: scheduleId },
          data: {
            status: updates.status,
            isActive: false, 
          },
        });

        await tx.fittingSlot.update({
          where: { id: schedule.fittingSlotId },
          data: { isBooked: false },
        });

        return { message: 'Schedule updated successfully' };
      } else {
        const newSchedule = await tx.fittingSchedule.update({
          where: { id: scheduleId },
          data: {
            ...(updates.status && { status: updates.status }),
            ...(updates.note !== undefined && { note: updates.note }),
          },
        });
        return newSchedule;
      }
    }, {
      timeout: 10000, // Increase timeout to 10 seconds
    });

    // Send emails AFTER the transaction is complete
    if ((isConfirming || isRejecting) && caller.role === 'OWNER') {
      try {
        const formattedFittingDate = formatFittingDate(scheduleForEmail.fittingSlot.dateTime);
        const customerName = `${scheduleForEmail.user.first_name || ''} ${scheduleForEmail.user.last_name || ''}`.trim() || scheduleForEmail.user.username || 'Customer';
        const ownerName = scheduleForEmail.fittingSlot.owner.businessName || `${scheduleForEmail.fittingSlot.owner.first_name} ${scheduleForEmail.fittingSlot.owner.last_name || ''}`.trim();

        if (isConfirming) {
          const productNames = scheduleForEmail.FittingProduct.map(fp => fp.variantProduct.products.name);
          
          await emailService.notifyCustomerFittingConfirmed({
            customerEmail: scheduleForEmail.user.email,
            customerName,
            ownerName,
            businessName: scheduleForEmail.fittingSlot.owner.businessName || undefined,
            businessAddress: scheduleForEmail.fittingSlot.owner.businessAddress || undefined,
            ownerPhone: scheduleForEmail.fittingSlot.owner.phone_numbers || undefined,
            fittingDate: formattedFittingDate,
            fittingId: scheduleForEmail.id,
            productNames,
            note: updates.note || scheduleForEmail.note || undefined,
          });
        } else if (isRejecting) {
          await emailService.notifyCustomerFittingRejected({
            customerEmail: scheduleForEmail.user.email,
            customerName,
            ownerName,
            businessName: scheduleForEmail.fittingSlot.owner.businessName || undefined,
            fittingDate: formattedFittingDate,
            fittingId: scheduleForEmail.id,
            rejectionReason: updates.note || undefined,
          });
        }
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json(updatedSchedule);
  } catch (error: any) {
    console.error('Error updating fitting schedule:', error);
    const status = error.message.includes('not found')
      ? 404
      : error.message.includes('Access denied')
      ? 403
      : 500;
    return NextResponse.json(
      { error: 'Error updating fitting schedule', details: error.message },
      { status },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const resolvedParams = await params;
    const scheduleId = parseInt(resolvedParams.id);

    const schedule = await prisma.fittingSchedule.findUnique({
      where: { id: scheduleId },
      include: {
        fittingSlot: {
          select: {
            id: true,
            ownerId: true,
          },
        },
        FittingProduct: true,
      },
    });

    if (!schedule) {
      return NextResponse.json(
        { error: 'Fitting schedule not found' },
        { status: 404 },
      );
    }

    const canDelete =
      caller.role === 'ADMIN' ||
      schedule.userId === caller.id ||
      (caller.role === 'OWNER' && schedule.fittingSlot.ownerId === caller.id);

    if (!canDelete) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.fittingSchedule.update({
        where: { id: scheduleId },
        data: {
          isActive: false,
          deletedAt: new Date(),
        },
      });

      await tx.fittingSlot.update({
        where: { id: schedule.fittingSlotId },
        data: { isBooked: false },
      });
    });

    return NextResponse.json({
      message: 'Fitting schedule canceled successfully',
    });

    return NextResponse.json({
      message: 'Fitting schedule deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting fitting schedule:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 },
    );
  }
}