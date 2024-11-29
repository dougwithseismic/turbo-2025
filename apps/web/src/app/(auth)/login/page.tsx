'use client'

import { AuthForm } from '@/components/auth/auth-form'
import { useAuth } from '@/providers/auth-provider'
import Link from 'next/link'

export default function LoginPage() {
  const { signIn, isLoading } = useAuth()

  return (
    <div className="container relative flex h-[100vh] flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email to sign in to your account
          </p>
        </div>

        <AuthForm type="login" onSubmit={signIn} isLoading={isLoading} />

        <div className="flex flex-col space-y-2 text-center text-sm">
          <Link
            href="/auth/reset-password"
            className="text-muted-foreground hover:text-primary underline underline-offset-4"
          >
            Forgot your password?
          </Link>
          <Link
            href="/register"
            className="text-muted-foreground hover:text-primary underline underline-offset-4"
          >
            Don&apos;t have an account? Sign Up
          </Link>
        </div>
      </div>
    </div>
  )
}
