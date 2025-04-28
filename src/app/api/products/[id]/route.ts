import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from 'lib/auth';

// GET product by id
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const product = await prisma.products.findUnique({
    where: { id: Number(params.id) },
    include: {
      owner: {
        select: { id: true, name: true },
      },
    },
  });

  if (!product) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(product);
}

// UPDATE product
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'OWNER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  // Make sure only owner can edit
  const product = await prisma.products.findUnique({
    where: { id: Number(params.id) },
  });

  if (!product || product.ownerId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const updated = await prisma.products.update({
    where: { id: Number(params.id) },
    data: body,
  });

  return NextResponse.json(updated);
}

// DELETE product
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'OWNER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const product = await prisma.products.findUnique({
    where: { id: Number(params.id) },
  });

  if (!product || product.ownerId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await prisma.products.delete({
    where: { id: Number(params.id) },
  });

  return NextResponse.json({ message: 'Deleted' });
}
