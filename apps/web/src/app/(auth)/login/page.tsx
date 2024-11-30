'use client'

import { AuthForm } from '@/components/auth/auth-form'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getErrorConfig } from '@/lib/errors'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const { signIn, isLoading, user } = useAuth()
  const [error, setError] = useState<Error | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  const handleSignIn = async ({
    email,
    password,
  }: {
    email: string
    password: string
  }): Promise<{ error: Error | null }> => {
    try {
      const result = await signIn({ email, password })
      if (result.error) {
        console.error('Failed to sign in:', result.error)
        setError(result.error)
      }
      return result
    } catch (err) {
      console.error('Failed to sign in:', err)
      const error = err instanceof Error ? err : new Error('Failed to sign in')
      setError(error)
      return { error }
    }
  }

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

        {error &&
          (() => {
            const errorConfig = getErrorConfig(error)
            return (
              <Alert
                variant={errorConfig.variant}
                className="animate-in fade-in-50"
              >
                <AlertDescription>
                  {errorConfig.message}
                  {errorConfig.action && (
                    <div className="mt-2">
                      <Link
                        href={errorConfig.action.href}
                        className="font-medium text-primary hover:underline"
                      >
                        {errorConfig.action.text}
                      </Link>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )
          })()}

        <AuthForm type="login" onSubmit={handleSignIn} isLoading={isLoading} />

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
