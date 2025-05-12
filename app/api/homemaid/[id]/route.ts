import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { parse } from 'path';

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; 
    console.log(id);
//    console.log(params.id)
    // const id = parseInt(params.id);

    const homemaid = await prisma.homemaid.findUnique({
      where: { id:parseInt(id) },
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
      return NextResponse.json(
        { error: 'Homemaid not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(homemaid, { status: 200 });
  } catch (error) {
    console.error('Error fetching homemaid:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


// model homemaid {
//     id                Int        @id @default(autoincrement())
//     officeID          Int?
//     weeklyStatusId   weeklyStatus[]
//     Nationalitycopy   String?    @db.VarChar(255)
//     Name              String?    @db.VarChar(255)
//     Religion          String?    @db.VarChar(255)
//     Passportnumber    String?    @db.VarChar(255)
//     clientphonenumber String?    @db.VarChar(15)
//     Picture           Json?
//     FullPicture           Json?
  
//     ExperienceYears   String?    @db.VarChar(255)
//     maritalstatus     String?    @db.VarChar(255)
//     Experience        String?    @db.VarChar(255)
//     dateofbirth       String?    @db.VarChar(255)
//     Nationality       Json?
//     age               Int?
//     flag              Json?
//     phone             String?    @db.VarChar(17)
//     bookingstatus     String?    @db.VarChar(255)
//     ages              String?    @db.VarChar(255)
//     officeName        String?    @db.VarChar(255)
//     office            offices?    @relation(fields: [officeName], references: [office])
//     NewOrder          neworder[]
//     Client            Client[]
//   experienceType      String?  @db.VarChar(100)
//   PassportStart       String? @db.VarChar(100)
//   PassportEnd       String? @db.VarChar(100)
//   OldPeopleCare       Boolean?
//   ArabicLanguageLeveL String? @db.VarChar(100)
//   EnglishLanguageLevel    String? @db.VarChar(100)
//   Salary                    String? @db.VarChar(20)
//   LaundryLeveL   String? @db.VarChar(20)
//   IroningLevel   String? @db.VarChar(20)
//   CleaningLeveL   String? @db.VarChar(20)
//   CookingLeveL   String? @db.VarChar(20)
//   SewingLeveL   String? @db.VarChar(20)
//   BabySitterLevel String? @db.VarChar(20)
//   Education String? @db.VarChar(60)
 
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; 
    const homemaidId = parseInt(id);
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
    // Validate required fields, or handle with default/fallback values
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
    }
    catch (error) {
        console.error('Error updating homemaid:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
        }
    }