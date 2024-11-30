import type { User } from '@supabase/supabase-js'
import type { AuthError } from '@/lib/errors'

export type LoadingState = 'idle' | 'progress' | 'complete' | 'error'

export interface AuthFormData {
  email: string
  password: string
}

export interface AuthResponse<T = null> {
  data: T
  error: AuthError | null
}

export interface AuthSession {
  user: User | null
  session: any | null
}

export type AuthResponseWithSession = AuthResponse<AuthSession>
