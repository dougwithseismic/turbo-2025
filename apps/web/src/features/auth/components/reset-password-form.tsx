'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'
import { motion } from 'motion/react'
import { useAuth } from '@/features/auth/hooks/use-auth'

const COOLDOWN_TIME = 60 // 60 seconds

export const ResetPasswordForm = () => {
  const { resetPassword } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [email, setEmail] = useState('')

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => {
        setCooldown((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [cooldown])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData(e.currentTarget)
      const emailValue = formData.get('email') as string
      if (!emailValue) {
        setError('Email is required')
        return
      }

      setEmail(emailValue)
      await resetPassword({ email: emailValue })
      setSuccess(true)
      setCooldown(COOLDOWN_TIME)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (cooldown > 0) return
    setIsLoading(true)
    setError(null)

    try {
      await resetPassword({ email })
      setCooldown(COOLDOWN_TIME)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col space-y-4"
      >
        <Alert>
          <AlertDescription>
            Check your email for a password reset link
          </AlertDescription>
        </Alert>
        <div className="flex flex-col space-y-2">
          <Button
            onClick={handleResend}
            disabled={cooldown > 0 || isLoading}
            variant="outline"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-current" />
              </div>
            ) : cooldown > 0 ? (
              `Resend in ${cooldown}s`
            ) : (
              'Resend reset link'
            )}
          </Button>
          <Button asChild variant="ghost">
            <Link href="/login">Back to login</Link>
          </Button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="grid gap-4"
    >
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="grid gap-2">
        <Input
          id="email"
          placeholder="name@example.com"
          type="email"
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect="off"
          name="email"
          required
          disabled={isLoading}
          className="transition-all duration-200"
        />
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-current" />
          </div>
        ) : (
          'Send reset link'
        )}
      </Button>
    </motion.form>
  )
}
