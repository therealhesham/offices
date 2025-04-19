import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { NodeNextResponse } from 'next/dist/server/base-http/node';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();


export async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const header = await headers();
    
    const token = header.get("authorization")?.split(' ')[1];
    const verify = jwt.decode(token)
    // console.log(verify)
 const recent = await prisma.homemaid.findMany({include:{NewOrder:true},
  where: {
    officeName: verify.office,
    NewOrder: {
      some: {
        createdAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 7)), // 7 days ago
        }
      },
    },
  },
});
// console.log(recent[0].NewOrder[0].bookingstatus)

    return NextResponse.json(recent);
  } catch (error) {
    console.log(error)
    return NextResponse.json(error);
    
    // res.status(500).json({ message: 'Internal Server Error' });
  }
}