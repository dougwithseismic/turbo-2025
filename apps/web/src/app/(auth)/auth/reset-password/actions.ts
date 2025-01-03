'use server'
import { executeResetPasswordRequest } from '@/features/auth/actions/auth-actions'
import { AuthResponse } from '@/features/auth/types/response'

export const handleResetPassword = async ({
  email,
}: {
  email: string
}): Promise<AuthResponse> => {
  return await executeResetPasswordRequest({ email })
}
