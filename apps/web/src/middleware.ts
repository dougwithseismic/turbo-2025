import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Skip metrics endpoint to avoid infinite loops
  if (request.nextUrl.pathname === '/api/metrics') {
    return NextResponse.next()
  }

  const response = NextResponse.next()

  // Add response headers for better tracking
  response.headers.set('x-response-time', Date.now().toString())

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public directory
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
