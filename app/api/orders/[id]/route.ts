import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
// import { authenticateToken } from '@/lib/auth';

const prisma = new PrismaClient();
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {

  try {
    // const user = await authenticateToken(request);
    // if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
const { id } = await params;
console.log(id);
    const order = await prisma.neworder.findUnique({
      where: { id: parseInt(id) },
      include: {
        client: true,
        HomeMaid: true,
        // OrderStatus: { orderBy: { createdAt: 'asc' } },
        arrivals: {
          select: {
            id: true,
            SponsorName: true,
            DeliveryDate: true,
            finaldestination: true,
            visaNumber: true,
            deparatureDate: true,
            KingdomentryDate: true,
            ArrivalCity: true,
            Notes: true
          }
        }
      }
    });

    // if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    return NextResponse.json(order);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}