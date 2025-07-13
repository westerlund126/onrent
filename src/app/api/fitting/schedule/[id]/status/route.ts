// /api/fitting/[id]/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from 'lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { status } = await request.json();
    const resolvedParams = await params;
    const fittingId = parseInt(resolvedParams.id);

    const updatedFitting = await prisma.fittingSchedule.update({
      where: { id: fittingId },
      data: { status },
      include: {
        user: true,
        fittingSlot: true,
        FittingProduct: true,
      },
    });

    return NextResponse.json(updatedFitting);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update fitting status' },
      { status: 500 },
    );
  }
}