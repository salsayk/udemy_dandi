import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Check for session token cookie (works in both dev and production)
  const sessionToken = request.cookies.get("next-auth.session-token")?.value 
    || request.cookies.get("__Secure-next-auth.session-token")?.value;

  // Also try to get the decoded token for additional validation
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });

  // User is authenticated if either the cookie exists or we have a valid token
  const isAuthenticated = !!sessionToken || !!token;

  // Protected routes - redirect to login if not authenticated
  const protectedPaths = ['/dashboards', '/playground', '/use-cases', '/billing', '/settings', '/protected'];
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    url.searchParams.set('message', 'Please sign in to access this page');
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (allow API access)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api).*)',
  ],
};
