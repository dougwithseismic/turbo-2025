export type AuthErrorCode =
  | 'invalid_email'
  | 'invalid_credentials'
  | 'server_error'
  | 'user_not_found'
  | 'email_not_confirmed'
  | 'weak_password'
  | 'email_taken'
  | 'invalid_code'

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
