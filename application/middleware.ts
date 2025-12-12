import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Lightweight middleware without full auth imports to stay under 1MB edge function limit
// Auth is handled server-side in individual pages/API routes

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow all API routes - they handle their own auth
  if (pathname.startsWith("/api/")) {
    return NextResponse.next()
  }

  // Allow static files and public routes
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico)$/)
  ) {
    return NextResponse.next()
  }

  // DEVELOPMENT BYPASS for localhost
  const forwardedHost = req.headers.get('x-forwarded-host') || req.headers.get('host') || '';
  const isLocalhost = forwardedHost.includes('localhost') || forwardedHost.includes('127.0.0.1');

  if (isLocalhost) {
    console.log('🔓 LOCALHOST BYPASS ENABLED');
    return NextResponse.next();
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
