export type AuthErrorCode =
  | 'invalid_email'
  | 'invalid_credentials'
  | 'server_error'
  | 'user_not_found'
  | 'email_not_confirmed'
  | 'weak_password'
  | 'email_taken'
  | 'invalid_code'
  | 'user_already_exists'

export type ErrorAction = {
  text: string
  href: string
}

export type ErrorConfig = {
  message: string
  variant: 'default' | 'destructive'
  action?: ErrorAction
}

interface AuthErrorOptions {
  message: string
  code: AuthErrorCode
}

export class AuthError extends Error {
  code: AuthErrorCode

  constructor({ message, code }: AuthErrorOptions) {
    super(message)
    this.code = code
    this.name = 'AuthError'
  }
}

export interface AuthResponse<T = void> {
  data: T | null
  error: AuthError | null
}

export const ERROR_CONFIGS: Record<AuthErrorCode, ErrorConfig> = {
  invalid_credentials: {
    message: 'Invalid email or password',
    variant: 'destructive',
    action: {
      text: 'Reset your password',
      href: '/auth/reset-password',
    },
  },
  email_not_confirmed: {
    message: 'Please verify your email address before signing in',
    variant: 'default',
    action: {
      text: 'Resend verification email',
      href: '/auth/verify-request',
    },
  },
  user_not_found: {
    message: "We couldn't find an account with that email",
    variant: 'default',
    action: {
      text: 'Create an account',
      href: '/register',
    },
  },
  invalid_email: {
    message: 'Please enter a valid email address',
    variant: 'destructive',
  },
  server_error: {
    message: 'An unexpected error occurred. Please try again later',
    variant: 'destructive',
  },
  email_taken: {
    message: 'An account with this email already exists',
    variant: 'default',
    action: {
      text: 'Sign in instead',
      href: '/login',
    },
  },
  user_already_exists: {
    message: 'An account with this email already exists',
    variant: 'default',
    action: {
      text: 'Sign in instead',
      href: '/login',
    },
  },
  weak_password: {
    message: 'Password is too weak. Please use a stronger password',
    variant: 'destructive',
  },
  invalid_code: {
    message: 'Invalid verification code',
    variant: 'destructive',
  },
}

export const getErrorConfig = (error: Error): ErrorConfig => {
  if (error instanceof AuthError) {
    return ERROR_CONFIGS[error.code]
  }
  return {
    message: error.message,
    variant: 'destructive',
  }
}
