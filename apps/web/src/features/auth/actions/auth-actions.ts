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
    console.error(err)
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
    console.error(err)
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
    console.error(err)
    const authError = new AuthError({
      message: 'Failed to sign out',
      code: 'server_error',
    })
    return { data: null, error: authError }
  }
}

export const executeUpdatePassword = async ({
  currentPassword,
  password,
}: {
  currentPassword?: string
  password: string
}): Promise<AuthResponse> => {
  try {
    if (currentPassword) {
      // Get current user's email
      const {
        data: { user },
      } = await supabaseClient.auth.getUser()
      if (!user?.email) {
        const authError = new AuthError({
          message: 'Unable to verify current password: user email not found',
          code: 'user_not_found',
        })
        toast.error(authError.message)
        return { data: null, error: authError }
      }

      // Verify current password
      const { error: signInError } =
        await supabaseClient.auth.signInWithPassword({
          email: user.email,
          password: currentPassword,
        })

      if (signInError) {
        const authError = new AuthError({
          message: 'Current password is incorrect',
          code: 'invalid_credentials',
        })
        toast.error(authError.message)
        return { data: null, error: authError }
      }
    }

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
    console.error(err)

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
    console.error(err)
    const authError = new AuthError({
      message: 'Failed to send reset password email',
      code: 'server_error',
    })
    toast.error(authError.message)
    return { data: null, error: authError }
  }
}

export const executeResendVerificationEmail = async ({
  email,
}: {
  email: string
}): Promise<AuthResponse> => {
  try {
    const redirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback?next=/dashboard`
    const { error: supabaseError } = await supabaseClient.auth.resend({
      type: 'signup',
      email,
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
      return { data: null, error: authError }
    }
    toast.success('Verification email resent. Please check your inbox.')
    return { data: null, error: null }
  } catch (err) {
    console.error(err)
    const authError = new AuthError({
      message: 'Failed to resend verification email',
      code: 'server_error',
    })
    toast.error(authError.message)
    return { data: null, error: authError }
  }
}

export const executeUpdateEmail = async ({
  email,
}: {
  email: string
}): Promise<AuthResponse> => {
  try {
    const { error: supabaseError } = await supabaseClient.auth.updateUser({
      email,
    })
    if (supabaseError) {
      const authError = new AuthError({
        message: supabaseError.message,
        code: supabaseError.code as AuthErrorCode,
      })
      toast.error(authError.message)
      return { data: null, error: authError }
    }
    toast.success('Please check your email to confirm the change')
    return { data: null, error: null }
  } catch (err) {
    console.error(err)
    const authError = new AuthError({
      message: 'Failed to update email',
      code: 'server_error',
    })
    toast.error(authError.message)
    return { data: null, error: authError }
  }
}

export const executeGetSession = async (): Promise<AuthResponseWithSession> => {
  try {
    const {
      data: { session },
      error: supabaseError,
    } = await supabaseClient.auth.getSession()
    if (supabaseError) {
      const authError = new AuthError({
        message: supabaseError.message,
        code: supabaseError.code as AuthErrorCode,
      })
      return { data: { user: null, session: null }, error: authError }
    }
    return {
      data: {
        user: session?.user ?? null,
        session: session ?? null,
      },
      error: null,
    }
  } catch (err) {
    console.error(err)
    const authError = new AuthError({
      message: 'Failed to get session',
      code: 'server_error',
    })
    return { data: { user: null, session: null }, error: authError }
  }
}

export const executeRefreshSession =
  async (): Promise<AuthResponseWithSession> => {
    try {
      const {
        data: { session },
        error: supabaseError,
      } = await supabaseClient.auth.refreshSession()
      if (supabaseError) {
        const authError = new AuthError({
          message: supabaseError.message,
          code: supabaseError.code as AuthErrorCode,
        })
        return { data: { user: null, session: null }, error: authError }
      }
      return {
        data: {
          user: session?.user ?? null,
          session: session ?? null,
        },
        error: null,
      }
    } catch (err) {
      console.error(err)
      const authError = new AuthError({
        message: 'Failed to refresh session',
        code: 'server_error',
      })
      return { data: { user: null, session: null }, error: authError }
    }
  }

export const executeGoogleSignIn = async (): Promise<{
  error: AuthError | null
}> => {
  try {
    const { data, error: supabaseError } =
      await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback?next=/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

    if (supabaseError) {
      const authError = new AuthError({
        message: supabaseError.message,
        code: supabaseError.code as AuthErrorCode,
      })
      toast.error(authError.message)
      return { error: authError }
    }

    // OAuth sign-in will redirect the user to Google's consent page
    window.location.href = data.url
    return { error: null }
  } catch (err) {
    console.error(err)
    const authError = new AuthError({
      message: 'Failed to sign in with Google',
      code: 'server_error',
    })
    toast.error(authError.message)
    return { error: authError }
  }
}
