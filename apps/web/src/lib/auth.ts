import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from './supabase/server'

/**
 * Get the current authenticated user session
 * @example
 * ```ts
 * const user = await auth()
 * if (user) {
 *   console.log('Authenticated user:', user)
 * } else {
 *   console.log('Not authenticated')
 * }
 * ```
 * @returns {Promise<User | null>} The authenticated user or null
 */
export const auth = cache(async () => {
  const supabase = await createSupabaseServerClient()
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      throw error
    }

    return user
  } catch (error) {
    console.error('Auth error:', error)
    return null
  }
})

/**
 * Middleware to protect routes from unauthenticated access
 * @example
 * ```ts
 * // In a route handler or page
 * const user = await protectedRoute()
 * // If we get here, we have an authenticated user
 * console.log('Authenticated user:', user)
 * ```
 * @returns {Promise<User>} The authenticated user
 * @throws {Redirect} Redirects to login page if not authenticated
 */
export const protectedRoute = async () => {
  const user = await auth()

  if (!user) {
    redirect('/login')
  }

  return user
}
