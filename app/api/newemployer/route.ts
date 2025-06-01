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
      experienceYears,fullBodyImage,
      maritalStatus,
      Experience,
      dateOfbirth,
      nationality,
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
      arabic,
      english,
      salary,
      skills,
      LaundryLeveL,
      IroningLevel,
      CleaningLeveL,
      CookingLeveL,
      SewingLeveL,
      email,personalImage,
      BabySitterLevel,
      education,
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
        ExperienceYears:experienceType,
        maritalstatus:maritalStatus,
        Experience:experienceType,
        dateofbirth:dateOfbirth,
        Nationality:nationality,
        age,
        flag,
        phone,
        bookingstatus,
        ages,
        office:{connect:{office:verify.office}},
        officeName:verify?.officeName,
        experienceType,
        PassportStart,
        PassportEnd,
        OldPeopleCare,
        ArabicLanguageLeveL:arabic,
        EnglishLanguageLevel:english,
        Salary:salary,
        LaundryLeveL:skills.laundry,
        IroningLevel:skills.ironing,
        CleaningLeveL:skills.cleaning,
        CookingLeveL:skills.cooking,
        SewingLeveL:skills.sewing,
        BabySitterLevel:skills.babySitting,
        Education:education,
      },
    });

try {
  
    await prisma.notifications.create({data:{title:"عاملة جديدة تم اضافتها",message:`تم اضافة عاملة جديدة من قبل المكتب الخارجي ${newHomemaid.officeName}`}})

  } catch (error) {
  console.log(error)
  }
    return new Response(JSON.stringify(newHomemaid), { status: 201 });
  } catch (error) {
    console.error('Error creating new homemaid:', error);
    return new Response(JSON.stringify({ error: 'Something went wrong' }), {
      status: 500,
    });
  }
}
