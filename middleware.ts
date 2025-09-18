
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
    
    // Skip middleware for login page and API routes
    if (pathname === '/login' || pathname.startsWith('/api/')) {
      return NextResponse.next();
    }

    // Check for token in cookies
    const token = req.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.rewrite(url); // Redirect to login page if not logged in
    }

    // Verify token
    const verify = jwt.decode(token);
    if (!verify) {
      return NextResponse.rewrite(url); // Redirect to login page if token is invalid
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