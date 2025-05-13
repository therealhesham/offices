import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { NodeNextResponse } from 'next/dist/server/base-http/node';
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers'
import jwt from "jsonwebtoken"
const prisma = new PrismaClient();


export async function GET(req:NextApiRequest, res: NextApiResponse) {
  try {
    const header = await headers();
const url = new URL(req.url)

const token = header.get("authorization")?.split(' ')[1];
const Name = url.searchParams.get("Name")
const Passportnumber =url.searchParams.get("Passportnumber")

const filters: any = {};

if (Name) filters.Name = { contains: (Name as string).toLowerCase() };
if (Passportnumber)
  filters.Passportnumber = {
    contains: (Passportnumber as string).toLowerCase(),
  };



const verify = jwt.decode(token)
    // res.
    const finder = await prisma.homemaid.findMany({take:20,skip:20*(Number(url.searchParams.get("page"))-1),where:{officeName:verify.office,...filters}});
   return NextResponse.json(finder);
  } catch (error) {
    console.log(error)
    // res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function DELETE(req:NextApiRequest, res: NextApiResponse) {
  try {
    const header = await headers();
const url = new URL(req.url)

const id = url.searchParams.get("id")


    // res.
const finder= await prisma.neworder.findUnique({where:{id: parseInt(id as string)}})
if(finder){

  return NextResponse.json(JSON.stringify({lange:{en:{message:"Record can't related as it's attached to Existing Order",ur:{message:"no message"},fra:{message :"no reserve"}}}}),{status:401})
}
  const deleter = await prisma.homemaid.delete({ where: { id:parseInt(id) } });
 
  return NextResponse.json({messages:"success"}, { status: 201 });

  } catch (error) {
    console.log(error)
    return NextResponse.json(error, { status: 500 });

  }
}