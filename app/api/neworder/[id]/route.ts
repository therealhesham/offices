import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { normalizeCustomStagesPrev } from '@/app/lib/customTimelineStagesJson';

const prisma = new PrismaClient();

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  try {
    const { id: idStr } = await params;
    const orderId = parseInt(idStr, 10);
    if (Number.isNaN(orderId)) {
      return NextResponse.json({ error: 'Invalid order id' }, { status: 400 });
    }

    const order = await prisma.neworder.findUnique({
      where: { id: orderId },
      include: {
        arrivals: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const arrival = order.arrivals.length > 0 ? order.arrivals[0] : null;

    return NextResponse.json({ order, arrival });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id: idStr } = await params;
    const orderId = parseInt(idStr, 10);
    if (Number.isNaN(orderId)) {
      return NextResponse.json({ error: 'Invalid order id' }, { status: 400 });
    }

    const body = await request.json();

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

    /** تحديث مرحلة مخصصة في JSON (سؤال / ملف) */
    if (body.patchCustomTimelineStage && typeof body.patchCustomTimelineStage === 'object') {
      const patch = body.patchCustomTimelineStage as {
        field?: string;
        answer?: string;
        fileUrl?: string;
      };
      const field = typeof patch.field === 'string' ? patch.field.trim() : '';
      if (!field) {
        return NextResponse.json({ error: 'patchCustomTimelineStage.field required' }, { status: 400 });
      }

      const prev = normalizeCustomStagesPrev(arrival.customTimelineStages);
      const prevField = { ...(prev[field] ?? {}) };
      const now = new Date().toISOString();

      if (patch.answer !== undefined) {
        const ans = String(patch.answer).trim();
        prevField.answer = ans;
        prevField.completed = ans.length > 0;
        prevField.date = now;
      }

      if (patch.fileUrl !== undefined && typeof patch.fileUrl === 'string' && patch.fileUrl.trim()) {
        prevField.fileUrl = patch.fileUrl.trim();
        prevField.completed = true;
        prevField.date = now;
      }

      const merged: Record<string, Record<string, unknown>> = {
        ...prev,
        [field]: prevField,
      };

      const updated = await prisma.arrivallist.update({
        where: { id: arrival.id },
        data: { customTimelineStages: merged as Prisma.InputJsonValue },
      });

      return NextResponse.json({ arrival: updated });
    }

    const medicalCheckFile =
      typeof body.medicalCheckFile === 'string' ? body.medicalCheckFile : undefined;
    if (medicalCheckFile) {
      const updated = await prisma.arrivallist.update({
        where: { id: arrival.id },
        data: {
          medicalCheckFile,
          medicalCheckDate: new Date(),
        },
      });

      return NextResponse.json({ arrival: updated });
    }

    return NextResponse.json(
      { error: 'Provide medicalCheckFile or patchCustomTimelineStage' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating arrival:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
