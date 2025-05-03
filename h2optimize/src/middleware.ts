import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";

// Define public routes
const publicRoutes = [
  '/',
  '/sign-in',
  '/sign-up',
  '/results',
  '/api/recommendations'
];

// Check if a path matches our public routes patterns
function isPublic(path: string) {
  return publicRoutes.some(publicPath => 
    path.startsWith(publicPath) || 
    path.startsWith('/_next/') || 
    path.includes('/sign-in') || 
    path.includes('/sign-up')
  );
}

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  // Allow public routes
  if (isPublic(path)) {
    return NextResponse.next();
  }
  
  // Get authentication state
  const { userId } = await getAuth(req);
  
  // If user is signed in, allow access
  if (userId) {
    return NextResponse.next();
  }
  
  // Redirect to sign-in if not authenticated
  const signInUrl = new URL('/sign-in', req.url);
  signInUrl.searchParams.set('redirect_url', path);
  return NextResponse.redirect(signInUrl);
}

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api/auth routes
     * 2. /_next (Next.js internals)
     * 3. /fonts (Inside public folder)
     * 4. /favicon.ico, /sitemap.xml, /robots.txt (static files)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
