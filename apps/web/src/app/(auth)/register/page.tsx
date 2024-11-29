'use client'

import { AuthForm } from '@/components/auth/auth-form'
import { useAuth } from '@/providers/auth-provider'
import Link from 'next/link'

export default function RegisterPage() {
  const { signUp, isLoading } = useAuth()

  return (
    <div className="container relative flex h-[100vh] flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Create an account
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email below to create your account
          </p>
        </div>

        <AuthForm type="register" onSubmit={signUp} isLoading={isLoading} />

        <div className="text-center text-sm">
          <Link
            href="/login"
            className="text-muted-foreground hover:text-primary underline underline-offset-4"
          >
            Already have an account? Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
