'use server'
import { clientConfig } from '@/config/app-config'
import { Database } from '@repo/supabase'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { cache } from 'react'
/**
 * Creates a Supabase client for Server Components
 */
export const createSupabaseServerClient = cache(async () => {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    clientConfig.SUPABASE.URL!,
    clientConfig.SUPABASE.ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  )
})
