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
      console.error('Error:', error.message)
      return null
    }

    return user
  } catch (error) {
    console.error('Error:', error)
    return null
  }
})

/**
 * Middleware to protect routes
 */
export async function protectedRoute() {
  const user = await auth()

  if (!user) {
    redirect('/login')
  }

  return user
}

/**
 * Sign in with email and password
 */
export async function signInWithPassword(email: string, password: string) {
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
export async function signUpWithPassword(email: string, password: string) {
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
export async function signOut({
  destinationUrl = '/login',
}: {
  destinationUrl?: string
}) {
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
export async function resetPassword(email: string) {
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
export async function updatePassword(password: string) {
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
export async function getProfile() {
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
    console.error('Error:', error.message)
    return null
  }

  return profile
}

/**
 * Update user profile
 */
export async function updateProfile({
  full_name,
  phone,
}: {
  full_name?: string
  phone?: string
}) {
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
