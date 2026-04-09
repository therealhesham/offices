import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers'
 
const prisma = new PrismaClient();

export async function POST(req) {
  try {
    // Parse the request body
    const m = await req.json();
    const fetching = await prisma.offices.findFirst({
      where: { office_id: m.id, password: m.password },
    });


    if (fetching) {
      const country = fetching.Country?.trim() || null;
      let useCustomTimeline = false;
      if (country) {
        const row = await prisma.customTimeline.findUnique({
          where: { country },
        });
        useCustomTimeline = !!(row && row.isActive);
      }

      const signing = jwt.sign(
        {
          id: fetching.id,
          office: fetching.office,
          url: fetching.url,
          country,
        },
        'sss',
        { expiresIn: '24h' }
      );

      const cookieStore = await cookies();
      cookieStore.set('token', signing);
      return NextResponse.json(
        { token: signing, country, useCustomTimeline },
        { status: 201 }
      );
    } else {
      return NextResponse.json({ error: 'Office not found' }, { status: 404 });
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
