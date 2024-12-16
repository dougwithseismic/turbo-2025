import { clientConfig } from '@/config/app-config'
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export const updateSession = async ({ request }: { request: NextRequest }) => {
  // First check if we have the auth cookie
  const hasAuthCookie = request.cookies.get('sb-access-token')
  const isAuthRoute = ['/login', '/register', '/auth', '/'].some((path) =>
    request.nextUrl.pathname.startsWith(path),
  )

  // If no auth cookie and not on auth route, redirect to login
  if (!hasAuthCookie && !isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    clientConfig.SUPABASE.URL,
    clientConfig.SUPABASE.ANON_KEY,
    {
      cookies: {
        getAll: () => {
          return request.cookies.getAll()
        },
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // Only verify the session if we have an auth cookie
  if (hasAuthCookie) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // If no user but we had a cookie, redirect to login (session expired)
    if (!user && !isAuthRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
