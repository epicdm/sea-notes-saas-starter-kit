import { auth } from "@/auth"
import { NextResponse } from "next/server"

// Routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/admin",
  "/agents",
  "/phone-numbers",
  "/calls",
  "/analytics",
  "/settings",
]

// Routes that should redirect authenticated users away
const authRoutes = ["/auth/signin", "/auth/signup"]

export default auth((req) => {
  const { pathname } = req.nextUrl

  // DEVELOPMENT BYPASS: Only allow actual localhost access (not proxied requests)
  // Check X-Forwarded-Host first (set by Apache), fall back to Host header
  const forwardedHost = req.headers.get('x-forwarded-host') || req.headers.get('host') || '';
  const isLocalhost = forwardedHost.includes('localhost') || forwardedHost.includes('127.0.0.1');

  if (isLocalhost) {
    console.log('🔓 LOCALHOST BYPASS ENABLED');
    return NextResponse.next();
  }

  // Allow all API routes - they handle their own auth
  if (pathname.startsWith("/api/")) {
    return NextResponse.next()
  }

  const isAuthenticated = !!req.auth

  // Debug logging
  console.log(`🔒 Middleware check: ${pathname}, auth: ${isAuthenticated ? 'YES (NextAuth)' : 'NONE'}`)

  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // Redirect unauthenticated users to sign in
  if (isProtectedRoute && !isAuthenticated) {
    console.log(`🔐 Redirecting to sign-in: ${pathname} (no NextAuth session)`)
    const signInUrl = new URL("/auth/signin", req.url)
    signInUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(signInUrl)
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && isAuthenticated) {
    console.log(`✅ Redirecting authenticated user to dashboard`)
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
