import type { AuthError } from '@/lib/errors'
import type { Session, User } from '@supabase/supabase-js'

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
  session: Session | null
}

export type AuthResponseWithSession = AuthResponse<AuthSession>
