import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Only apply to admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Check for the special admin token cookie - much simpler approach
    const isAdmin = request.cookies.get('admin_token')?.value === 'true';
    
    // If not admin, redirect to unauthorized page
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    
    // User is an admin, allow access
    return NextResponse.next();
  }
  
  // Not an admin route, allow access
  return NextResponse.next();
}

// Configure the paths that middleware should run on
export const config = {
  matcher: ['/admin/:path*']
};
