import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const orderId = parseInt(params.id);

    // Fetch neworder
    const order = await prisma.neworder.findUnique({
      where: { id: orderId },
      include: {
        arrivals: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Fetch related arrivallist
    const arrival = order.arrivals.length > 0 ? order.arrivals[0] : null;

    return NextResponse.json({ order, arrival });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}