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
      // Sign the JWT with office data (could be a subset of the office data, not the entire object)
      const signing = jwt.sign({ id: fetching.id, office: fetching.office ,url:fetching.url}, "sss", {
        expiresIn: '24h', // Optionally add expiration time
      });

      const cookieStore = await cookies()
      cookieStore.set("token",signing)
      // Return the signed JWT in the response
      return NextResponse.json({ token: signing }, { status: 201 });
    } else {
      return NextResponse.json({ error: 'Office not found' }, { status: 404 });
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
