import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import AWS from 'aws-sdk';
import { getSpacesPublicObjectUrl } from '@/app/lib/spacesPublicUrl';
import { normalizeCustomStagesPrev } from '@/app/lib/customTimelineStagesJson';

const prisma = new PrismaClient();

type Params = { params: Promise<{ id: string }> };

const MAX_BYTES = 25 * 1024 * 1024;

function initS3() {
  const region = process.env.DO_SPACES_REGION || 'sgp1';
  if (!process.env.DO_SPACES_KEY || !process.env.DO_SPACES_SECRET) {
    throw new Error('DO_SPACES_KEY / DO_SPACES_SECRET not configured');
  }
  const endpoint = new AWS.Endpoint(`${region}.digitaloceanspaces.com`);
  return new AWS.S3({
    endpoint,
    accessKeyId: process.env.DO_SPACES_KEY,
    secretAccessKey: process.env.DO_SPACES_SECRET,
    s3ForcePathStyle: true,
    signatureVersion: 'v4',
    region,
  });
}

function safeFileSegment(name: string, max = 180): string {
  return name.replace(/[/\\?*[\]:"|<>]/g, '_').slice(0, max) || 'file';
}

/**
 * POST multipart: field (string), file (File)
 * يرفع إلى Spaces من السيرفر ثم يحدّث customTimelineStages.
 */
export async function POST(request: Request, { params }: Params) {
  try {
    const { id: idStr } = await params;
    const orderId = parseInt(idStr, 10);
    if (Number.isNaN(orderId)) {
      return NextResponse.json({ error: 'Invalid order id' }, { status: 400 });
    }

    const bucket = process.env.DO_SPACES_BUCKET?.trim();
    const region = process.env.DO_SPACES_REGION || 'sgp1';
    if (!bucket) {
      return NextResponse.json({ error: 'DO_SPACES_BUCKET not configured' }, { status: 500 });
    }

    const formData = await request.formData();
    const fieldRaw = formData.get('field');
    const field = typeof fieldRaw === 'string' ? fieldRaw.trim() : '';
    const file = formData.get('file');

    if (!field) {
      return NextResponse.json({ error: 'field required' }, { status: 400 });
    }
    if (field === 'medicalCheck') {
      return NextResponse.json(
        {
          error:
            'Use PATCH medicalCheckFile on the order arrival for medical check files, not custom stage upload.',
        },
        { status: 400 }
      );
    }
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: 'file required' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'File too large' }, { status: 413 });
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

    const s3 = initS3();
    const buf = Buffer.from(await file.arrayBuffer());
    const safeField = safeFileSegment(field, 120);
    const safeName = safeFileSegment(file.name);
    const key = `custom-timeline/${orderId}/${safeField}/${Date.now()}_${safeName}`;

    await s3
      .upload({
        Bucket: bucket,
        Key: key,
        Body: buf,
        ACL: 'public-read',
        ContentType: file.type || 'application/octet-stream',
      })
      .promise();

    const fileUrl = getSpacesPublicObjectUrl(bucket, region, key);
    const now = new Date().toISOString();
    const prev = normalizeCustomStagesPrev(arrival.customTimelineStages);
    const prevField = { ...(prev[field] ?? {}) };
    prevField.fileUrl = fileUrl;
    prevField.completed = true;
    prevField.date = now;

    const merged: Record<string, Record<string, unknown>> = {
      ...prev,
      [field]: prevField,
    };

    const updated = await prisma.arrivallist.update({
      where: { id: arrival.id },
      data: { customTimelineStages: merged as Prisma.InputJsonValue },
    });

    return NextResponse.json({ arrival: updated });
  } catch (error) {
    console.error('custom-stage-upload:', error);
    const msg = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
