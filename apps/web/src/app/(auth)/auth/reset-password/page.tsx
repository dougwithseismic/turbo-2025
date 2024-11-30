import Link from 'next/link'
import { ResetPasswordForm } from './components/reset-password-form'
import { handleResetPassword } from './actions'

export default function ResetPasswordPage() {
  return (
    <div className="container relative flex h-[100vh] flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Reset password
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email address and we will send you a password reset link
          </p>
        </div>

        <ResetPasswordForm onSubmit={handleResetPassword} />

        <div className="text-center text-sm">
          <Link
            href="/login"
            className="text-muted-foreground hover:text-primary underline underline-offset-4"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}
