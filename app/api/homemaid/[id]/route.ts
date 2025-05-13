import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken'; // Example: Using jsonwebtoken for JWT decoding
import { cookies } from 'next/headers';
const prisma = new PrismaClient();

// Secret key for JWT (replace with your actual secret, ideally from environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'sss';

// Helper function to get the authenticated user's office
async function getUserOffice(request: Request): Promise<string | null> {
  try {
    const cookieStore = await cookies()
      const token =cookieStore.get('token')
    console.log(token?.value)
    // Extract JWT from Authorization header (format: Bearer <token>)
    // const authHeader = request.headers.get('Authorization');
    // if (!authHeader || !authHeader.startsWith('Bearer ')) {
    //   return null;
    // }

    // Decode JWT (replace with your actual JWT verification logic)
    if (!token ) {
      throw new Error('Invalid or missing token');
    }
    const decoded = jwt.verify(token?.value, "sss") as { office: string };
    if (!decoded || !decoded.office) {  
      return null;
    }

    return decoded.office;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Extract homemaid ID from params
    const { id } = await params;
    const homemaidId = parseInt(id);

    // Get the authenticated user's office
    const userOffice = await getUserOffice(request);
    if (!userOffice) {
      return NextResponse.json({ error: 'Unauthorized: Invalid or missing authentication' }, { status: 401 });
    }

    // Fetch the homemaid record
    const homemaid = await prisma.homemaid.findUnique({
      where: { id: homemaidId },
      include: {
        weeklyStatusId: true,
        office: true,
        NewOrder: true,
        Client: true,
        Session: true,
        logs: true,
        Housed: true,
        inHouse: {
          include: {
            checkIns: true,
          },
        },
      },
    });

    if (!homemaid) {
      return NextResponse.json({ error: 'Homemaid not found' }, { status: 404 });
    }

    // Check if the user's office matches the homemaid's officeName
    // If officeName can be null, handle it (e.g., deny access or allow if null is valid)
    if (!homemaid.officeName || homemaid.officeName !== userOffice) {
      return NextResponse.json({ error: 'Forbidden: You do not have access to this homemaid' }, { status: 403 });
    }

    return NextResponse.json(homemaid, { status: 200 });
  } catch (error) {
    console.error('Error fetching homemaid:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    // Ensure Prisma client is disconnected to prevent connection leaks
    await prisma.$disconnect();
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Extract homemaid ID from params
    const { id } = await params;
    const homemaidId = parseInt(id);

    // Get the authenticated user's office
    const userOffice = await getUserOffice(request);
    if (!userOffice) {
      return NextResponse.json({ error: 'Unauthorized: Invalid or missing authentication' }, { status: 401 });
    }

    // Fetch the homemaid record to check officeName
    const homemaid = await prisma.homemaid.findUnique({
      where: { id: homemaidId },
      select: { officeName: true },
    });

    if (!homemaid) {
      return NextResponse.json({ error: 'Homemaid not found' }, { status: 404 });
    }

    // Check if the user's office matches the homemaid's officeName
    // If officeName can be null, handle it (e.g., deny access or allow if null is valid)
    if (!homemaid.officeName || homemaid.officeName !== userOffice) {
      return NextResponse.json({ error: 'Forbidden: You do not have access to this homemaid' }, { status: 403 });
    }

    // Parse request body for update data
    const body = await request.json();
    const {
      officeID,
      Nationalitycopy,
      Name,
      Religion,
      Passportnumber,
      clientphonenumber,
      Picture,
      ExperienceYears,
      maritalstatus,
      Experience,
      dateofbirth,
      Nationality,
      age,
      flag,
      phone,
      bookingstatus,
      ages,
      officeName,
      experienceType,
      PassportStart,
      PassportEnd,
      OldPeopleCare,
      ArabicLanguageLeveL,
      EnglishLanguageLevel,
      Salary,
      LaundryLeveL,
      IroningLevel,
      CleaningLeveL,
      CookingLeveL,
      SewingLeveL,
      BabySitterLevel,
      Education,
    } = body;

    // Update the homemaid record
    const updatedHomemaid = await prisma.homemaid.update({
      where: { id: homemaidId },
      data: {
        officeID,
        Nationalitycopy,
        Name,
        Religion,
        Passportnumber,
        clientphonenumber,
        Picture,
        ExperienceYears,
        maritalstatus,
        Experience,
        dateofbirth,
        Nationality,
        age,
        flag,
        phone,
        bookingstatus,
        ages,
        officeName,
        experienceType,
        PassportStart,
        PassportEnd,
        OldPeopleCare,
        ArabicLanguageLeveL,
        EnglishLanguageLevel,
        Salary,
        LaundryLeveL,
        IroningLevel,
        CleaningLeveL,
        CookingLeveL,
        SewingLeveL,
        BabySitterLevel,
        Education,
      },
      include: {
        office: true,
        NewOrder: true,
        Client: true,
        Session: true,
        logs: true,
        Housed: true,
        inHouse: {
          include: {
            checkIns: true,
          },
        },
      },
    });

    return NextResponse.json(updatedHomemaid, { status: 200 });
  } catch (error) {
    console.error('Error updating homemaid:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    // Ensure Prisma client is disconnected to prevent connection leaks
    await prisma.$disconnect();
  }
}