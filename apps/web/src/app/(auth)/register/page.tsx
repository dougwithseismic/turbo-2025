'use client'

import { AuthForm } from '@/components/auth/auth-form'
import { useAuth } from '@/features/auth/hooks/use-auth'

import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'
import { useState } from 'react'
import { getErrorConfig } from '@/lib/errors'

export default function RegisterPage() {
  const { signUp, isLoading } = useAuth()
  const [error, setError] = useState<Error | null>(null)

  const handleSignUp = async ({
    email,
    password,
  }: {
    email: string
    password: string
  }): Promise<{ error: Error | null }> => {
    try {
      const result = await signUp({ email, password })
      console.log('result', result)
      if (result.error) {
        console.error('Failed to create account:', result.error)
        setError(result.error)
      }
      return result
    } catch (err) {
      console.error('Failed to create account:', err)
      const error =
        err instanceof Error ? err : new Error('Failed to create account')
      setError(error)
      return { error }
    }
  }

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

        {error &&
          (() => {
            const errorConfig = getErrorConfig(error)
            return (
              <Alert variant={errorConfig.variant}>
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

        <AuthForm
          type="register"
          onSubmit={handleSignUp}
          isLoading={isLoading}
        />

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
