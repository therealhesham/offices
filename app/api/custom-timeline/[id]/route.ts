import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import type { TimelineStage } from '@/app/lib/timelineStage';

const prisma = new PrismaClient();

function parseStages(raw: unknown): TimelineStage[] {
  if (!Array.isArray(raw)) return [];
  return raw as TimelineStage[];
}

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const body = await request.json();
    const data: {
      country?: string;
      name?: string | null;
      stages?: unknown;
      isActive?: boolean;
    } = {};

    if (typeof body.country === 'string') data.country = body.country.trim();
    if ('name' in body) data.name = typeof body.name === 'string' ? body.name.trim() || null : null;
    if (Array.isArray(body.stages)) data.stages = body.stages;
    if (typeof body.isActive === 'boolean') data.isActive = body.isActive;

    const updated = await prisma.customTimeline.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      ...updated,
      stages: parseStages(updated.stages),
    });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    await prisma.customTimeline.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
