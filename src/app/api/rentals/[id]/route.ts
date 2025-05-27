// app/api/rentals/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from 'lib/prisma';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const rentalId = parseInt(params.id);

    if (isNaN(rentalId)) {
      return NextResponse.json(
        { error: 'Invalid rental ID format' },
        { status: 400 },
      );
    }

    const rental = await prisma.rental.findUnique({
      where: { id: rentalId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            first_name: true,
            last_name: true,
            phone_numbers: true,
            email: true,
          },
        },
        owner: {
          select: {
            id: true,
            username: true,
            businessName: true,
            phone_numbers: true,
          },
        },
        products: {
          select: {
            id: true,
            name: true,
            category: true,
            description: true,
            images: true,
          },
        },
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
          },
        },
        Tracking: {
          orderBy: { updatedAt: 'desc' },
        },
        Return: true,
      },
    });

    if (!rental) {
      return NextResponse.json({ error: 'Rental not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: rental,
    });
  } catch (error) {
    console.error('Get rental error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const rentalId = parseInt(params.id);

    if (isNaN(rentalId)) {
      return NextResponse.json(
        { error: 'Invalid rental ID format' },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { status, startDate, endDate, variantId } = body;

    const existingRental = await prisma.rental.findUnique({
      where: { id: rentalId },
      include: {
        variantProduct: true,
      },
    });

    if (!existingRental) {
      return NextResponse.json({ error: 'Rental not found' }, { status: 404 });
    }

    const validStatuses = ['BELUM_LUNAS', 'LUNAS', 'TERLAMBAT', 'SELESAI'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: 'Invalid status. Must be one of: ' + validStatuses.join(', '),
        },
        { status: 400 },
      );
    }

    let parsedStartDate, parsedEndDate;
    if (startDate) {
      parsedStartDate = new Date(startDate);
      if (isNaN(parsedStartDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid start date format' },
          { status: 400 },
        );
      }
    }

    if (endDate) {
      parsedEndDate = new Date(endDate);
      if (isNaN(parsedEndDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid end date format' },
          { status: 400 },
        );
      }
    }

    const finalStartDate = parsedStartDate || existingRental.startDate;
    const finalEndDate = parsedEndDate || existingRental.endDate;

    if (finalEndDate <= finalStartDate) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 },
      );
    }

    if (variantId && variantId !== existingRental.variantProductId) {
      const newVariantId = parseInt(variantId);
      if (isNaN(newVariantId)) {
        return NextResponse.json(
          { error: 'Invalid variant ID format' },
          { status: 400 },
        );
      }

      const newVariant = await prisma.variantProducts.findUnique({
        where: { id: newVariantId },
        include: { products: true },
      });

      if (!newVariant) {
        return NextResponse.json(
          { error: 'Variant not found' },
          { status: 404 },
        );
      }

      if (!newVariant.isAvailable || newVariant.isRented) {
        return NextResponse.json(
          { error: 'New variant is not available' },
          { status: 400 },
        );
      }

      const productOwner = await prisma.user.findUnique({
        where: { id: variantId.products.ownerId },
        select: { id: true, role: true },
      });

      if (!productOwner || productOwner.role !== 'OWNER') {
        return NextResponse.json(
          { error: 'Product owner not found or invalid' },
          { status: 404 },
        );
      }

      const conflictingRental = await prisma.rental.findFirst({
        where: {
          variantProductId: newVariantId,
          id: { not: rentalId },
          OR: [
            {
              AND: [
                { startDate: { lte: finalStartDate } },
                { endDate: { gte: finalStartDate } },
              ],
            },
            {
              AND: [
                { startDate: { lte: finalEndDate } },
                { endDate: { gte: finalEndDate } },
              ],
            },
            {
              AND: [
                { startDate: { gte: finalStartDate } },
                { endDate: { lte: finalEndDate } },
              ],
            },
          ],
          status: { not: 'SELESAI' },
        },
      });

      if (conflictingRental) {
        return NextResponse.json(
          { error: 'New variant is already rented for the selected dates' },
          { status: 400 },
        );
      }
    }

    if ((startDate || endDate) && !variantId) {
      const conflictingRental = await prisma.rental.findFirst({
        where: {
          variantProductId: existingRental.variantProductId,
          id: { not: rentalId },
          OR: [
            {
              AND: [
                { startDate: { lte: finalStartDate } },
                { endDate: { gte: finalStartDate } },
              ],
            },
            {
              AND: [
                { startDate: { lte: finalEndDate } },
                { endDate: { gte: finalEndDate } },
              ],
            },
            {
              AND: [
                { startDate: { gte: finalStartDate } },
                { endDate: { lte: finalEndDate } },
              ],
            },
          ],
          status: { not: 'SELESAI' },
        },
      });

      if (conflictingRental) {
        return NextResponse.json(
          { error: 'Variant is already rented for the selected dates' },
          { status: 400 },
        );
      }
    }

    // Perform the update in a transaction
    const updatedRental = await prisma.$transaction(async (tx) => {
      // Prepare update data
      const updateData: any = {};
      if (status !== undefined) updateData.status = status;
      if (parsedStartDate) updateData.startDate = parsedStartDate;
      if (parsedEndDate) updateData.endDate = parsedEndDate;

      // If changing variant
      if (variantId && variantId !== existingRental.variantProductId) {
        const newVariantId = parseInt(variantId);

        await tx.variantProducts.update({
          where: { id: existingRental.variantProductId },
          data: { isRented: false },
        });

        await tx.variantProducts.update({
          where: { id: newVariantId },
          data: { isRented: true },
        });

        const newVariant = await tx.variantProducts.findUnique({
          where: { id: newVariantId },
          include: { products: true },
        });

        updateData.variantProductId = newVariantId;
        updateData.productsId = newVariant!.products.id;
        updateData.ownerId = newVariant.products.ownerId;
        updateData.productsId = newVariant.products.id;
        updateData.variantProductId = newVariantId;
      }

      // Update rental
      const rental = await tx.rental.update({
        where: { id: rentalId },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              first_name: true,
              last_name: true,
              phone_numbers: true,
            },
          },
          owner: {
            select: {
              id: true,
              username: true,
              businessName: true,
              phone_numbers: true,
            },
          },
          products: {
            select: { id: true, name: true },
          },
          variantProduct: {
            select: {
              id: true,
              sku: true,
              size: true,
              color: true,
              price: true,
            },
          },
          Tracking: {
            orderBy: { updatedAt: 'desc' },
            take: 1,
          },
        },
      });

      if (status && status !== existingRental.status) {
        let trackingStatus;
        switch (status) {
          case 'LUNAS':
            trackingStatus = 'RENTAL_ONGOING';
            break;
          case 'SELESAI':
            trackingStatus = 'COMPLETED';
            break;
          default:
            trackingStatus = 'RENTAL_ONGOING';
        }

        await tx.tracking.create({
          data: {
            rentalId: rentalId,
            status: trackingStatus,
          },
        });
      }

      return rental;
    });

    return NextResponse.json({
      success: true,
      message: 'Rental updated successfully',
      data: updatedRental,
    });
  } catch (error) {
    console.error('Update rental error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const rentalId = parseInt(params.id);

    if (isNaN(rentalId)) {
      return NextResponse.json(
        { error: 'Invalid rental ID format' },
        { status: 400 },
      );
    }

    // Check if rental exists
    const existingRental = await prisma.rental.findUnique({
      where: { id: rentalId },
      include: {
        variantProduct: true,
        Tracking: true,
        Return: true,
      },
    });

    if (!existingRental) {
      return NextResponse.json({ error: 'Rental not found' }, { status: 404 });
    }

    // Prevent deletion if rental is ongoing or has returns
    if (
      existingRental.status === 'LUNAS' ||
      existingRental.status === 'TERLAMBAT'
    ) {
      return NextResponse.json(
        {
          error:
            'Cannot delete active rental. Please complete or cancel the rental first.',
        },
        { status: 400 },
      );
    }

    if (existingRental.Return && existingRental.Return.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete rental with return records' },
        { status: 400 },
      );
    }

    // Delete in transaction
    await prisma.$transaction(async (tx) => {
      // Delete related tracking records
      await tx.tracking.deleteMany({
        where: { rentalId: rentalId },
      });

      // Delete the rental
      await tx.rental.delete({
        where: { id: rentalId },
      });

      // Update variant to not rented if it was rented for this rental
      if (existingRental.variantProduct.isRented) {
        await tx.variantProducts.update({
          where: { id: existingRental.variantProductId },
          data: { isRented: false },
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Rental deleted successfully',
    });
  } catch (error) {
    console.error('Delete rental error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
