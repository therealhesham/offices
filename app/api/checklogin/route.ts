import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { NodeNextResponse } from 'next/dist/server/base-http/node';
import { NextResponse } from 'next/server';
import jwt from "jsonwebtoken"

import { cookies, headers } from 'next/headers';
const prisma = new PrismaClient();

export async function GET(request: NextApiRequest, res: NextApiResponse) {
  try {
      const cookieStore = await cookies()
      const tokenGetter = cookieStore.get("token")

if (!tokenGetter?.value) {
    throw new Error("Token not found");
}
const verify = jwt.verify(tokenGetter.value, 'sss');
if(!verify){

    throw new Error("Not found")
}


    return NextResponse.json(verify,{status:201});
  } catch (error) {
    console.log(error)
    return    NextResponse.redirect(new URL("/login", request.url));

  }
}