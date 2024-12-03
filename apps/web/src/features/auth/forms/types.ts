export type AuthType = 'login' | 'register' | 'reset-password'

export interface AuthSubmitParams {
  email: string
  password: string
}

export interface AuthSubmitResult {
  error: Error | null
}

export interface AuthFormProps {
  type: AuthType
  onSubmit: (params: AuthSubmitParams) => Promise<AuthSubmitResult>
  isLoading: boolean
  onLockoutChange?: (isLockedOut: boolean) => void
}

export interface SecurityState {
  attempts: number
  lockoutTimer: number
  lastAttempt: number
}

export interface FormState {
  email: string
  password: string
  showPassword: boolean
  error: string | null
  shake: boolean
  acceptedTerms: boolean
}
