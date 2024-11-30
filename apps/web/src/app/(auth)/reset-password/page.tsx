'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { getErrorConfig } from '@/lib/errors'
import { Metadata } from 'next'

export default function ResetPassword() {
  const { resetPassword, loadingState } = useAuth()
  const [error, setError] = useState<Error | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const isLoading = loadingState === 'progress'

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const formData = new FormData(event.currentTarget)
    const email = formData.get('email') as string

    try {
      const result = await resetPassword({ email })
      if (result.error) {
        setError(result.error)
      } else {
        setIsSubmitted(true)
      }
    } catch (err) {
      console.error('Failed to request password reset:', err)
      setError(
        err instanceof Error
          ? err
          : new Error('Failed to request password reset'),
      )
    }
  }

  if (isSubmitted) {
    return (
      <div className="container relative flex h-[100vh] flex-col items-center justify-center">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Check Your Email
            </h1>
            <p className="text-sm text-muted-foreground">
              We've sent you a password reset link. Please check your email.
            </p>
          </div>
          <Button asChild>
            <Link href="/sign-in">Back to Sign In</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container relative flex h-[100vh] flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Reset Password
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email address and we'll send you a reset link
          </p>
        </div>

        {error && (
          <Alert
            variant={getErrorConfig(error).variant}
            className="animate-in fade-in-50"
          >
            <AlertDescription>{getErrorConfig(error).message}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="name@example.com"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>

        <Button variant="link" asChild className="px-0">
          <Link href="/sign-in">Back to Sign In</Link>
        </Button>
      </div>
    </div>
  )
}
