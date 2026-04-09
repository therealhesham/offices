import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import type { TimelineStage } from '@/app/lib/timelineStage';

const prisma = new PrismaClient();

function parseStages(raw: unknown): TimelineStage[] {
  if (!Array.isArray(raw)) return [];
  return raw as TimelineStage[];
}

type Params = { params: Promise<{ country: string }> };

/**
 * GET /api/custom-timeline/by-country/[country]
 * يُرجع التايم لاين النشط فقط إن وُجد (country مطابقة للنص المخزَّن).
 */
export async function GET(_request: Request, { params }: Params) {
  try {
    const { country: encoded } = await params;
    const country = decodeURIComponent(encoded || '').trim();
    if (!country) {
      return NextResponse.json({ error: 'country required' }, { status: 400 });
    }

    const row = await prisma.customTimeline.findUnique({
      where: { country },
    });

    if (!row || !row.isActive) {
      return NextResponse.json(
        { error: 'No active timeline found for this country' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: row.id,
      country: row.country,
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
