import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
// import { authenticateToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    // const user = await authenticateToken(request);
    // if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { status } = await request.json();
    const orderStatus = await prisma.orderStatus.create({
      data: {
        orderId: parseInt(params.id),
        status,
        createdAt: new Date()
      }
    });

    return NextResponse.json(orderStatus);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}