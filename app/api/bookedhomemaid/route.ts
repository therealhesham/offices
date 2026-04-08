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
const Name = url.searchParams.get("Name")
const Passportnumber =url.searchParams.get("Passportnumber")
const listFilter = url.searchParams.get("filter")

const filters: any = {};

if (Name) filters.Name = { contains: (Name as string).toLowerCase() };
if (Passportnumber)
  filters.Passportnumber = {
    contains: (Passportnumber as string).toLowerCase(),
  };

const newOrderSome: { HomemaidId: { not: { equals: null } }; bookingstatus?: { contains: string } } = {
  HomemaidId: { not: { equals: null } },
};
if (listFilter === "new") {
  newOrderSome.bookingstatus = { contains: "new" };
}

const verify = jwt.decode(token)

if(!verify){

  throw new Error("not available token")
}
const newOrderInclude =
  listFilter === "new"
    ? {
        where: {
          HomemaidId: { not: { equals: null } },
          bookingstatus: { contains: "new" },
        },
        orderBy: { createdAt: "desc" as const },
      }
    : true;

const homemaidsWithOrders = await prisma.homemaid.findMany({take:20,skip:20*(Number(url.searchParams.get("page"))-1),
  where: {
    
    officeName:verify?.office,...filters,
    NewOrder: {
      some: newOrderSome,
    }
  },
  include: {
    NewOrder: newOrderInclude,
  },
});

return NextResponse.json(homemaidsWithOrders);
  } catch (error) {
    console.log(error)
    return new Response(JSON.stringify(error), { status: 500 });
  }
}