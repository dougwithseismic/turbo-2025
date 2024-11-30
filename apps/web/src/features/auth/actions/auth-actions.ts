import { AuthError, AuthErrorCode } from '@/lib/errors'
import { supabaseClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import type {
  AuthFormData,
  AuthResponse,
  AuthResponseWithSession,
} from '../types'

export const executeSignIn = async ({
  email,
  password,
}: AuthFormData): Promise<AuthResponseWithSession> => {
  try {
    const { data: authData, error: supabaseError } =
      await supabaseClient.auth.signInWithPassword({
        email,
        password,
      })
    if (supabaseError) {
      const authError = new AuthError({
        message: supabaseError.message,
        code: supabaseError.code as AuthErrorCode,
      })
      toast.error(authError.message)
      return { data: { user: null, session: null }, error: authError }
    }
    return {
      data: { user: authData.user, session: authData.session },
      error: null,
    }
  } catch (err) {
    const authError = new AuthError({
      message: 'An unexpected error occurred',
      code: 'server_error',
    })
    toast.error(authError.message)
    return { data: { user: null, session: null }, error: authError }
  }
}

export const executeSignUp = async ({
  email,
  password,
}: AuthFormData): Promise<AuthResponseWithSession> => {
  try {
    const redirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback?next=/dashboard`
    console.log('redirectUrl', redirectUrl)
    const { data: authData, error: supabaseError } =
      await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      })

    if (supabaseError) {
      const authError = new AuthError({
        message: supabaseError.message,
        code: supabaseError.code as AuthErrorCode,
      })
      toast.error(authError.message)
      return { data: { user: null, session: null }, error: authError }
    }

    toast.success('Please check your email to verify your account.')
    return {
      data: { user: authData.user, session: authData.session },
      error: null,
    }
  } catch (err) {
    const authError = new AuthError({
      message: 'An unexpected error occurred',
      code: 'server_error',
    })
    toast.error(authError.message)
    return { data: { user: null, session: null }, error: authError }
  }
}

export const executeSignOut = async (): Promise<AuthResponse> => {
  try {
    const { error: supabaseError } = await supabaseClient.auth.signOut()
    if (supabaseError) {
      const authError = new AuthError({
        message: supabaseError.message,
        code: 'server_error',
      })
      return { data: null, error: authError }
    }
    return { data: null, error: null }
  } catch (err) {
    const authError = new AuthError({
      message: 'Failed to sign out',
      code: 'server_error',
    })
    return { data: null, error: authError }
  }
}

export const executeUpdatePassword = async ({
  password,
}: {
  password: string
}): Promise<AuthResponse> => {
  try {
    const { error: supabaseError } = await supabaseClient.auth.updateUser({
      password,
    })

    if (supabaseError) {
      const authError = new AuthError({
        message: supabaseError.message,
        code: supabaseError.code as AuthErrorCode,
      })
      toast.error(authError.message)
      return { data: null, error: authError }
    }

    toast.success('Password updated successfully')
    return { data: null, error: null }
  } catch (err) {
    const authError = new AuthError({
      message: 'Failed to update password',
      code: 'server_error',
    })
    toast.error(authError.message)
    return { data: null, error: authError }
  }
}

export const executeResetPasswordRequest = async ({
  email,
}: {
  email: string
}): Promise<AuthResponse> => {
  try {
    const redirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback?next=/account/update-password`
    const { error: supabaseError } =
      await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      })

    if (supabaseError) {
      const authError = new AuthError({
        message: supabaseError.message,
        code: supabaseError.code as AuthErrorCode,
      })
      toast.error(authError.message)
      return { data: null, error: authError }
    }

    toast.success('Check your email for the password reset link')
    return { data: null, error: null }
  } catch (err) {
    const authError = new AuthError({
      message: 'Failed to send reset password email',
      code: 'server_error',
    })
    toast.error(authError.message)
    return { data: null, error: authError }
  }
}
