'use server'

import { resetPassword } from '@/lib/auth'

export const handleResetPassword = async (email: string): Promise<void> => {
  return resetPassword(email)
}
