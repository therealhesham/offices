import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
// import { authenticateToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // const user = await authenticateToken(request);
    // if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const {
      ClientName, PhoneNumber, clientID, HomemaidId, bookingstatus,
      profileStatus, Nationalitycopy, Name, Religion, Passportnumber,
      nationalId, clientphonenumber, ExperienceYears, maritalstatus,
      Experience, dateofbirth, age, phone, ages
    } = body;

    const order = await prisma.neworder.create({
      data: {
        ClientName,
        PhoneNumber,
        clientID,
        HomemaidId,
        bookingstatus,
        profileStatus,
        Nationalitycopy,
        Name,
        Religion,
        Passportnumber,
        nationalId,
        clientphonenumber,
        ExperienceYears,
        maritalstatus,
        Experience,
        dateofbirth,
        age,
        phone,
        ages,
        // updatedBy: user.username
      },
      include: { client: true, HomeMaid: true }
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}