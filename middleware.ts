
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
 
import jwt from "jsonwebtoken"


export async function middleware(req:NextRequest) {
  const url = req.nextUrl.clone()
  url.pathname = '/login'

  try {
    const { pathname } = req.nextUrl;
    const cookieStore = await cookies()
  const token =cookieStore.get('token')
    const verify = jwt.decode(token.value)
    console.log(url)
    // console.log(cookieStore)

    // Example: If user is trying to access the "/admin" route, check if they are logged in
    if (pathname.startsWith('/')) {
      // const user = req.cookies.user || null; // Assuming user is saved in cookies
      if (!verify) {
        return NextResponse.rewrite(url); // Redirect to login page if not logged in
      }
    }
  
    return NextResponse.next(); 
      
  } catch (error) {
    return NextResponse.rewrite(url); 
    
  }
}


export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
  // matcher: '/app',
}