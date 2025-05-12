import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
// import { authenticateToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // const user = await authenticateToken(request);
    // if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const arrivals = await prisma.arrivallist.findMany({
      where: { OrderId: parseInt(params.id) },
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
    });

    return NextResponse.json(arrivals);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch arrivals' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    // const user = await authenticateToken(request);
    // if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const {
      SponsorName, DeliveryDate, finaldestination, visaNumber,
      deparatureDate, KingdomentryDate, ArrivalCity, Notes
    } = await request.json();

    const arrival = await prisma.arrivallist.create({
      data: {
        OrderId: parseInt(params.id),
        SponsorName,
        DeliveryDate: new Date(DeliveryDate),
        finaldestination,
        visaNumber,
        deparatureDate: new Date(deparatureDate),
        KingdomentryDate: new Date(KingdomentryDate),
        ArrivalCity,
        Notes
      }
    });

    return NextResponse.json(arrival, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create arrival' }, { status: 500 });
  }
}