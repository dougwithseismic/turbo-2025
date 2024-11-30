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

/**
 * Sign in with email and password
 * @example
 * ```ts
 * try {
 *   const { user, session } = await signInWithPassword('user@example.com', 'password123')
 *   console.log('Signed in user:', user)
 * } catch (error) {
 *   console.error('Failed to sign in:', error)
 * }
 * ```
 * @param email - The user's email
 * @param password - The user's password
 * @returns {Promise<{ user: User | null; session: Session | null }>} The authentication data
 * @throws {Error} If the sign-in fails
 */
export const signInWithPassword = async (email: string, password: string) => {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw error
  }

  return data
}

/**
 * Sign up with email and password
 * @example
 * ```ts
 * try {
 *   const { user, session } = await signUpWithPassword('user@example.com', 'SecurePass123')
 *   console.log('Signed up user:', user)
 * } catch (error) {
 *   console.error('Failed to sign up:', error)
 * }
 * ```
 * @param email - The user's email
 * @param password - The user's password (must contain at least 8 characters, one uppercase, one lowercase, and one number)
 * @returns {Promise<{ user: User | null; session: Session | null }>} The authentication data
 * @throws {Error} If password validation fails or sign-up fails
 */
export const signUpWithPassword = async (email: string, password: string) => {
  // Validate password strength
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters')
  }

  if (!/[A-Z]/.test(password)) {
    throw new Error('Password must contain at least one uppercase letter')
  }

  if (!/[a-z]/.test(password)) {
    throw new Error('Password must contain at least one lowercase letter')
  }

  if (!/[0-9]/.test(password)) {
    throw new Error('Password must contain at least one number')
  }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error) {
    throw error
  }

  return data
}

/**
 * Sign out the current user
 * @example
 * ```ts
 * try {
 *   await signOut({ destinationUrl: '/home' })
 *   // User is signed out and redirected
 * } catch (error) {
 *   console.error('Failed to sign out:', error)
 * }
 * ```
 * @param {Object} params - The sign-out parameters
 * @param {string} [params.destinationUrl='/login'] - The URL to redirect to after sign-out
 * @throws {Error} If the sign-out fails
 * @returns {Promise<never>} Never returns, always redirects
 */
export const signOut = async ({
  destinationUrl = '/login',
}: {
  destinationUrl?: string
}) => {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error
  }

  redirect(destinationUrl)
}

/**
 * Reset password for a user's email account
 * @example
 * ```ts
 * try {
 *   await resetPassword('user@example.com')
 *   // Email sent with reset instructions
 * } catch (error) {
 *   console.error('Failed to reset password:', error)
 * }
 * ```
 * @param email - The email address of the user
 * @throws {Error} If the password reset request fails
 * @returns {Promise<void>}
 */
export const resetPassword = async (email: string) => {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
  })

  if (error) {
    console.error('Failed to reset password:', error)
    throw error
  }
}

/**
 * Update user's password with validation
 * @example
 * ```ts
 * try {
 *   await updatePassword('NewSecurePass123')
 *   // Password updated successfully
 * } catch (error) {
 *   console.error('Failed to update password:', error)
 * }
 * ```
 * @param password - The new password (must contain at least 8 characters, one uppercase, one lowercase, and one number)
 * @throws {Error} If password validation fails or update request fails
 * @returns {Promise<void>}
 */
export const updatePassword = async (password: string) => {
  // Validate password strength
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters')
  }

  if (!/[A-Z]/.test(password)) {
    throw new Error('Password must contain at least one uppercase letter')
  }

  if (!/[a-z]/.test(password)) {
    throw new Error('Password must contain at least one lowercase letter')
  }

  if (!/[0-9]/.test(password)) {
    throw new Error('Password must contain at least one number')
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    throw error
  }
}

/**
 * Retrieve the current user's profile from the database
 * @example
 * ```ts
 * const profile = await getProfile()
 * if (profile) {
 *   console.log('User profile:', profile)
 * } else {
 *   console.log('User not authenticated')
 * }
 * ```
 * @returns {Promise<null | Record<string, any>>} The user profile data or null if not authenticated
 * @throws {Error} If the database query fails
 */
export const getProfile = async () => {
  const supabase = await createSupabaseServerClient()
  const user = await auth()

  if (!user) {
    return null
  }

  const { data: profile, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    throw error
  }

  return profile
}

/**
 * Update the current user's profile information
 * @example
 * ```ts
 * try {
 *   await updateProfile({
 *     full_name: 'John Doe',
 *     phone: '+1234567890'
 *   })
 *   // Profile updated successfully
 * } catch (error) {
 *   console.error('Failed to update profile:', error)
 * }
 * ```
 * @param {Object} params - The profile update parameters
 * @param {string} [params.full_name] - The user's full name
 * @param {string} [params.phone] - The user's phone number
 * @throws {Error} If not authenticated or if the update fails
 * @returns {Promise<void>}
 */
export const updateProfile = async ({
  full_name,
  phone,
}: {
  full_name?: string
  phone?: string
}) => {
  const supabase = await createSupabaseServerClient()
  const user = await auth()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { error } = await supabase
    .from('users')
    .update({
      full_name,
      phone,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    throw error
  }
}

/**
 * Sign in with Google OAuth
 * @example
 * ```ts
 * try {
 *   const { user, session } = await signInWithGoogle()
 *   console.log('Signed in user:', user)
 * } catch (error) {
 *   console.error('Failed to sign in with Google:', error)
 * }
 * ```
 * @returns {Promise<{ user: User | null; session: Session | null }>} The authentication data
 * @throws {Error} If the Google sign-in fails
 */
export const signInWithGoogle = async () => {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })

  if (error) {
    throw error
  }

  return data
}
