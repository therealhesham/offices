import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import type { TimelineStage } from '@/app/lib/timelineStage';

const prisma = new PrismaClient();

function parseStages(raw: unknown): TimelineStage[] {
  if (!Array.isArray(raw)) return [];
  return raw as TimelineStage[];
}

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/custom-timeline/by-office/[id]
 * يُرجع التايم لاين النشط فقط إن وُجد (officeId).
 */
export async function GET(_request: Request, { params }: Params) {
  try {
    const { id: encoded } = await params;
    const officeId = parseInt(decodeURIComponent(encoded || '').trim(), 10);
    if (!officeId || isNaN(officeId)) {
      return NextResponse.json({ error: 'officeId required' }, { status: 400 });
    }

    const row = await prisma.customTimeline.findUnique({
      where: { officeId },
    });

    if (!row || !row.isActive) {
      return NextResponse.json(
        { error: 'No active timeline found for this office' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: row.id,
      officeId: row.officeId,
      name: row.name,
      stages: parseStages(row.stages),
      isActive: row.isActive,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
