import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const m = await req.json();
    const fetching = await prisma.offices.findFirst({
      where: { office_id: m.id, url: m.url },
    });

    if (fetching) {
      const signing = jwt.sign(
        { id: fetching.id, office: fetching.office, url: fetching.url },
        "sss",
        { expiresIn: '1h' }
      );

      const cookieStore = await cookies();
      cookieStore.set("token", signing);
      return NextResponse.json({ token: signing }, { status: 201 });
    } else {
      return NextResponse.json({ error: 'Office not found' }, { status: 404 });
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const {url } = await req.json();
console.log(url)
    // Verify JWT token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, "sss");
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // // Ensure the office_id matches the token's id or add other authorization logic
    // if (decoded.id !== office_id) {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }

    // Update the office record with the logo URL
    const updatedOffice = await prisma.offices.update({
      where: { id: decoded.id },
      data: { url }, // Assuming `logo_url` is a field in your Prisma schema
    });
         const signing = jwt.sign({ id: updatedOffice.id, office: updatedOffice.office ,url:updatedOffice.url}, "sss", {
            expiresIn: '1h', // Optionally add expiration time
          });
    
    return NextResponse.json({ message: 'Logo updated successfully', token: signing }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}