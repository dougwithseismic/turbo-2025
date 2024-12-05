import { updateSession } from '@/lib/supabase/middleware';
import { type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Skip health check for maintenance page and static assets
  if (
    request.nextUrl.pathname === '/maintenance' ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/favicon.ico')
  ) {
    return await updateSession({ request });
  }

  // // Check database connection
  // const isDatabaseHealthy = await checkDatabaseConnection()

  // if (!isDatabaseHealthy) {
  //   const maintenanceUrl = new URL('/maintenance', request.url)
  //   return NextResponse.redirect(maintenanceUrl)
  // }

  return await updateSession({ request });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
