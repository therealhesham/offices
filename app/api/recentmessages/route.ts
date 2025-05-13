import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { redirect } from 'next/navigation';

// Initialize Prisma client
const prisma = new PrismaClient();

// Utility function to validate JWT and extract office name
async function getOfficeNameFromToken() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');
    
    if (!token?.value) {
      throw new Error('Token is missing');
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'sss');
    
    if (typeof decoded !== 'string' && 'office' in decoded) {
      return decoded.office as string;
    }
    
    throw new Error('Invalid token payload');
  } catch (error) {
    console.error('Token validation error:', error);
    redirect('/login');
  }
}

// GET: Fetch messages based on type (inbox or sent)
export async function GET(req: Request) {
  const officeName = await getOfficeNameFromToken();
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'inbox'; // Default to inbox

  try {
    const whereClause = {isRead:false,
      officeName,
      ...(type === 'inbox' ? { type: 'inbox' } : { type: 'sent' }),
    };

    const messages = await prisma.officemssages.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        sender: true,
        type: true,
        message: true,
        createdAt: true,
        updatedAt: true,
        isRead: true,
        officeName: true,
      },
      orderBy: { createdAt: 'desc' }, // Sort by newest first
    });
console.log(whereClause)
    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect(); // Ensure Prisma disconnects
  }
}

// POST: Send a new message
export async function POST(req: Request) {
  const officeName = await getOfficeNameFromToken();
  
  try {
    const body = await req.json();
    const { message, type = 'sent', title, sender } = body;

    // Validate required fields
    if (!message || !type) {
      return NextResponse.json(
        { error: 'Message and type are required' },
        { status: 400 }
      );
    }

    // Create new message
    const newMessage = await prisma.officemssages.create({
      data: {
        title: title || 'Untitled', // Default title if not provided
        sender: sender || 'Anonymous', // Default sender if not provided
        type,
        message,
        officeName,
        isRead: false,
      },
    });

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}