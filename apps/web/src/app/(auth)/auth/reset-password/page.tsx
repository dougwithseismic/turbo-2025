import { Metadata } from 'next'
import { ResetPasswordForm } from '@/features/auth/components/reset-password-form'

export const metadata: Metadata = {
  title: 'Reset Password | Your App Name',
  description: 'Reset your password by entering your email address.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function ResetPasswordPage() {
  return (
    <div className="container relative flex h-full flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Reset password
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email address and we will send you a password reset link
          </p>
        </div>

        <ResetPasswordForm />
      </div>
    </div>
  )
}
