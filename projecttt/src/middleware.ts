import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // If the user is authenticated and tries to access login/register pages,
    // redirect them to the home page
    if (
      req.nextauth.token &&
      (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/register')
    ) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to login and register pages without authentication
        if (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/register') {
          return true;
        }
        // Require authentication for all other pages
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}; 