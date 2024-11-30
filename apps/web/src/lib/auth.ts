import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from './supabase/server'

/**
 * Get the current session
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
 * Middleware to protect routes
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
 * Sign out
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
 * Reset password
 */
export const resetPassword = async (email: string) => {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
  })

  if (error) {
    throw error
  }
}

/**
 * Update password
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
 * Get user profile
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
 * Update user profile
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
