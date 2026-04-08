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

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const orderId = parseInt(params.id, 10);
    if (Number.isNaN(orderId)) {
      return NextResponse.json({ error: 'Invalid order id' }, { status: 400 });
    }

    const body = await request.json();
    const medicalCheckFile =
      typeof body.medicalCheckFile === 'string' ? body.medicalCheckFile : undefined;
    if (!medicalCheckFile) {
      return NextResponse.json({ error: 'medicalCheckFile required' }, { status: 400 });
    }

    const order = await prisma.neworder.findUnique({
      where: { id: orderId },
      include: { arrivals: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const arrival = order.arrivals[0];
    if (!arrival) {
      return NextResponse.json({ error: 'Arrival record not found' }, { status: 404 });
    }

    const updated = await prisma.arrivallist.update({
      where: { id: arrival.id },
      data: {
        medicalCheckFile,
        medicalCheckDate: new Date(),
      },
    });

    return NextResponse.json({ arrival: updated });
  } catch (error) {
    console.error('Error updating arrival:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}