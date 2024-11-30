'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { getErrorConfig } from '@/lib/errors'

export default function UpdatePassword() {
  const { updatePassword, loadingState } = useAuth()
  const [error, setError] = useState<Error | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const code = searchParams.get('code')
  const isLoading = loadingState === 'progress'

  useEffect(() => {
    // If no code is present and we're not in the middle of updating,
    // redirect to reset-password page
    if (!code && !isLoading) {
      router.push('/reset-password')
    }
  }, [code, isLoading, router])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const formData = new FormData(event.currentTarget)
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password !== confirmPassword) {
      setError(new Error('Passwords do not match'))
      return
    }

    try {
      const result = await updatePassword({ password })
      if (result.error) {
        setError(result.error)
      }
    } catch (err) {
      console.error('Failed to update password:', err)
      setError(
        err instanceof Error ? err : new Error('Failed to update password'),
      )
    }
  }

  if (!code) {
    return null // Prevent flash of content before redirect
  }

  return (
    <div className="container relative flex h-[100vh] flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Update Password
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your new password below
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
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Enter your new password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              placeholder="Confirm your new password"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update Password'}
          </Button>
        </form>
      </div>
    </div>
  )
}
