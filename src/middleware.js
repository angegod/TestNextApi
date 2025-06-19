import { NextResponse } from 'next/server';

export function middleware(request) {
  const path = request.nextUrl.pathname;

  const validPrefixes = ['/', '/intro', '/simulator', '/import','/enchant'];
  const isValid = validPrefixes.includes(path);
  if (!isValid) {
    return NextResponse.redirect(new URL('http://localhost:3000/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/|favicon.ico|api/|static/|.*\\..*).*)'],
};
