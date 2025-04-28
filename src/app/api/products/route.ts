import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth'; // if you use NextAuth
import { authOptions } from 'lib/auth';


// GET all products
export async function GET() {
  const products = await prisma.products.findMany({
    include: {
      owner: {
        select: { id: true, name: true },
      },
    },
  });

  return NextResponse.json(products);
}

const MOCK_SESSION = {
  user: { id: 3, role: 'OWNER' },
};

// POST create product (Owner Only)
export async function POST(req: Request) {
  const session = MOCK_SESSION;

  const body = await req.json();
  const { name, category, size, color, price, stock, images } = body;

  const product = await prisma.products.create({
    data: {
      name,
      category,
      size,
      color,
      price,
      stock,
      images,
      ownerId: session.user.id,
    },
  });

  return NextResponse.json(product, { status: 201 });
}
