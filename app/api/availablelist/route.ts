// @ts-ignore

import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { NodeNextResponse } from 'next/dist/server/base-http/node';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import jwt from "jsonwebtoken"

const prisma = new PrismaClient();


export async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
const url = new    URL(req.url)
const header = await headers();

const token = header.get("authorization")?.split(' ')[1];

const Name = url.searchParams.get("fullname")
const Passportnumber =url.searchParams.get("phonenumber")

const filters: any = {};

if (Name) filters.Name = { contains: (Name as string).toLowerCase() };
if (Passportnumber)
  filters.Passportnumber = {
    contains: (Passportnumber as string).toLowerCase(),
  };



const verify = jwt.decode(token)
if(!verify){

  throw new Error("not available token")
}

const homemaidsWithoutOrder = await prisma.homemaid.findMany({take:20,skip:20*(Number(url.searchParams.get("page"))-1),
  where: {officeName:verify.office,...filters
,    NewOrder: {
      none: {} 
    }
  }
})

// console.log(url.searchParams.get("page"))
return NextResponse.json(homemaidsWithoutOrder);
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Internal Server Error' });
  }
}