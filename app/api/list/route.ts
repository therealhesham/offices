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





const verify = jwt.decode(token)
    // res.
    const finder = await prisma.homemaid.findMany({take:20,skip:20*(Number(url.searchParams.get("page"))-1),where:{officeName:verify.office}});
   return NextResponse.json(finder);
  } catch (error) {
    console.log(error)
    // res.status(500).json({ message: 'Internal Server Error' });
  }
}