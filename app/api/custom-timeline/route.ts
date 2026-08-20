import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import type { TimelineStage } from '@/app/lib/timelineStage';

const prisma = new PrismaClient();

function parseStages(raw: unknown): TimelineStage[] {
  if (!Array.isArray(raw)) return [];
  return raw as TimelineStage[];
}

/** GET /api/custom-timeline — قائمة كل التايم لاينز */
export async function GET() {
  try {
    const items = await prisma.customTimeline.findMany({
      orderBy: { officeId: 'asc' },
    });
    const mapped = items.map((t) => ({
      id: t.id,
      officeId: t.officeId,
      name: t.name,
      stages: parseStages(t.stages),
      isActive: t.isActive,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));
    return NextResponse.json({ items: mapped });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

/** POST /api/custom-timeline — إنشاء */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const officeId = typeof body.officeId === 'number' ? body.officeId : parseInt(body.officeId, 10);
    if (!officeId || isNaN(officeId)) {
      return NextResponse.json({ error: 'officeId is required' }, { status: 400 });
    }
    const stages = body.stages;
    if (!Array.isArray(stages) || stages.length === 0) {
      return NextResponse.json({ error: 'stages array required' }, { status: 400 });
    }

    const created = await prisma.customTimeline.create({
      data: {
        officeId,
        name: typeof body.name === 'string' ? body.name.trim() || null : null,
        stages,
        isActive: body.isActive !== false,
      },
    });

    return NextResponse.json({
      ...created,
      stages: parseStages(created.stages),
    });
  } catch (e: unknown) {
    const msg = e && typeof e === 'object' && 'code' in e && (e as { code?: string }).code === 'P2002'
      ? 'Timeline for this office already exists'
      : 'Internal server error';
    console.error(e);
    return NextResponse.json({ error: msg }, { status: msg.includes('exists') ? 409 : 500 });
  } finally {
    await prisma.$disconnect();
  }
}
