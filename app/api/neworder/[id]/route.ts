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
        /** لمرحلة externalOfficeInfo — نفس homemaidSource.officeName في وصل GET /api/track_order */
        HomeMaid: { select: { officeName: true } },
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

    /** نفس pages/api/track_order/[id].ts — موافقة المكتب الخارجي */
    if (
      body &&
      typeof body === 'object' &&
      body.field === 'externalOfficeApproval' &&
      typeof (body as { value?: unknown }).value === 'boolean'
    ) {
      const value = (body as { value: boolean }).value;
      const updatedArrival = await prisma.arrivallist.update({
        where: { id: arrival.id },
        data: {
          externalOfficeStatus: value ? 'approved' : 'pending',
          ExternalOFficeApproval: value ? new Date() : null,
        },
      });
      const updatedOrder = await prisma.neworder.update({
        where: { id: orderId },
        data: {
          bookingstatus: value ? 'external_office_approved' : 'pending_external_office',
        },
      });
      return NextResponse.json({ arrival: updatedArrival, order: updatedOrder });
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
      if (
        field === 'medicalCheck' ||
        field === 'visaIssuance' ||
        field === 'destinations' ||
        field === 'externalOfficeApproval' ||
        field === 'receipt'
      ) {
        return NextResponse.json(
          {
            error:
              'This stage uses database columns only (medicalCheckFile, VisaFile, ticketFile, externalOfficeFile, receivingFile). Use the dedicated PATCH fields.',
          },
          { status: 400 }
        );
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

      if (patch.fileUrl !== undefined) {
        if (patch.fileUrl === null || patch.fileUrl === '') {
          delete prevField.fileUrl;
          prevField.completed = false;
          prevField.date = now;
        } else if (typeof patch.fileUrl === 'string' && patch.fileUrl.trim()) {
          prevField.fileUrl = patch.fileUrl.trim();
          prevField.completed = true;
          prevField.date = now;
        }
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

    /** تاريخ الفحص الطبي فقط (بدون رفع ملف) — قيمة فارغة تمسح التاريخ */
    if ('medicalCheckDate' in body) {
      const raw = body.medicalCheckDate;
      let nextDate: Date | null = null;
      if (raw === null || raw === '') {
        nextDate = null;
      } else if (typeof raw === 'string') {
        const d = new Date(raw);
        if (Number.isNaN(d.getTime())) {
          return NextResponse.json({ error: 'Invalid medicalCheckDate' }, { status: 400 });
        }
        nextDate = d;
      } else {
        return NextResponse.json({ error: 'Invalid medicalCheckDate' }, { status: 400 });
      }
      const updated = await prisma.arrivallist.update({
        where: { id: arrival.id },
        data: { medicalCheckDate: nextDate },
      });
      return NextResponse.json({ arrival: updated });
    }

    /** مسح ملف الفحص الطبي من العمود */
    if ('medicalCheckFile' in body && body.medicalCheckFile === null) {
      const updated = await prisma.arrivallist.update({
        where: { id: arrival.id },
        data: {
          medicalCheckFile: null,
        },
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

    if ('VisaFile' in body && body.VisaFile === null) {
      const updated = await prisma.arrivallist.update({
        where: { id: arrival.id },
        data: { VisaFile: null },
      });
      return NextResponse.json({ arrival: updated });
    }
    const visaFilePatch = typeof body.VisaFile === 'string' ? body.VisaFile.trim() : '';
    if (visaFilePatch) {
      const updated = await prisma.arrivallist.update({
        where: { id: arrival.id },
        data: {
          VisaFile: visaFilePatch,
          visaIssuanceDate: new Date(),
        },
      });
      return NextResponse.json({ arrival: updated });
    }

    if ('ticketFile' in body && body.ticketFile === null) {
      const updated = await prisma.arrivallist.update({
        where: { id: arrival.id },
        data: { ticketFile: null },
      });
      return NextResponse.json({ arrival: updated });
    }
    const ticketPatch = typeof body.ticketFile === 'string' ? body.ticketFile.trim() : '';
    if (ticketPatch) {
      const updated = await prisma.arrivallist.update({
        where: { id: arrival.id },
        data: { ticketFile: ticketPatch },
      });
      return NextResponse.json({ arrival: updated });
    }

    if ('externalOfficeFile' in body && body.externalOfficeFile === null) {
      const updated = await prisma.arrivallist.update({
        where: { id: arrival.id },
        data: { externalOfficeFile: null },
      });
      return NextResponse.json({ arrival: updated });
    }
    const extOfficePatch =
      typeof body.externalOfficeFile === 'string' ? body.externalOfficeFile.trim() : '';
    if (extOfficePatch) {
      const updated = await prisma.arrivallist.update({
        where: { id: arrival.id },
        data: { externalOfficeFile: extOfficePatch },
      });
      return NextResponse.json({ arrival: updated });
    }

    if ('receivingFile' in body && body.receivingFile === null) {
      const updated = await prisma.arrivallist.update({
        where: { id: arrival.id },
        data: { receivingFile: null },
      });
      return NextResponse.json({ arrival: updated });
    }
    const receivingPatch = typeof body.receivingFile === 'string' ? body.receivingFile.trim() : '';
    if (receivingPatch) {
      const updated = await prisma.arrivallist.update({
        where: { id: arrival.id },
        data: { receivingFile: receivingPatch },
      });
      return NextResponse.json({ arrival: updated });
    }

    return NextResponse.json(
      {
        error:
          'Provide field+value (e.g. externalOfficeApproval), medicalCheckFile, medicalCheckDate, VisaFile, ticketFile, externalOfficeFile, receivingFile, or patchCustomTimelineStage',
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating arrival:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
