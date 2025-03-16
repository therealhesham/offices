// File: /app/api/offices/route.js
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers'
 
const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const m = await req.json();

      const cookieStore = await cookies()
      cookieStore.delete("token")
      return NextResponse.json({ error: 'logging out' }, { status: 201 });
   
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
