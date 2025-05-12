// app/api/homemaid/newemployer/route.js
import { PrismaClient } from '@prisma/client';
import jwt from "jsonwebtoken"
import { headers } from 'next/headers';
const prisma = new PrismaClient();
export async function POST(req) {
  try {
    // console.log(await req.json())


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
    } = await req.json();
    // Validate required fields, or handle with default/fallback values
const header = await headers();

const token = header.get("authorization")?.split(' ')[1];
const verify = jwt.decode(token)
console.log(verify.office)
    // Insert into the database
    const newHomemaid = await prisma.homemaid.create({
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
        office:{connect:{office:verify.office}},
        officeName:verify?.officeName,
        experienceType,
        PassportStart:new Date(PassportStart).toLocaleDateString(),
        PassportEnd:new Date(PassportEnd).toLocaleDateString(),
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
    });

    return new Response(JSON.stringify(newHomemaid), { status: 201 });
  } catch (error) {
    console.error('Error creating new homemaid:', error);
    return new Response(JSON.stringify({ error: 'Something went wrong' }), {
      status: 500,
    });
  }
}
