import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { NodeNextResponse } from 'next/dist/server/base-http/node';
import { NextResponse } from 'next/server';
import jwt from "jsonwebtoken"
import { headers } from 'next/headers';
const prisma = new PrismaClient();


export async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
const url = new    URL(req.url)
const header = await headers();

const token = header.get("authorization")?.split(' ')[1];
const verify = jwt.decode(token)
  if(!verify){

  throw new Error("not available token")
}
const homemaidsWithOrders = await prisma.homemaid.findMany({take:20,skip:20*(Number(url.searchParams.get("page"))-1),
  where: {
    
    officeName:verify?.office,
    NewOrder: {
      some: {} // checks that there is at least one related neworder entry
    }
  },
  include: {
    NewOrder: true, // this includes related neworder data
  },
});

return NextResponse.json(homemaidsWithOrders);
  } catch (error) {
    console.log(error)
    return new Response(JSON.stringify(error), { status: 500 });
  }
}