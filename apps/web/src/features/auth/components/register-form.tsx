'use client'

import { useState } from 'react'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'
import { AuthForm } from '../forms/auth-form'
import { getErrorConfig } from '@/lib/errors'
import { motion } from 'motion/react'
import { container, item } from '../animations/form-animations'

export const RegisterForm = () => {
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
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]"
    >
      <motion.div
        variants={item}
        className="flex flex-col space-y-2 text-center"
      >
        <motion.h1 className="text-2xl font-semibold tracking-tight">
          Create an account
        </motion.h1>
        <motion.p className="text-sm text-muted-foreground">
          Enter your email below to create your account
        </motion.p>
      </motion.div>

      {error && (
        <motion.div variants={item}>
          <Alert variant={getErrorConfig(error).variant}>
            <AlertDescription>
              {getErrorConfig(error).message}
              {getErrorConfig(error).action && (
                <div className="mt-2">
                  <Link
                    href={getErrorConfig(error).action!.href}
                    className="font-medium text-primary hover:underline"
                  >
                    {getErrorConfig(error).action!.text}
                  </Link>
                </div>
              )}
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      <motion.div variants={item}>
        <AuthForm
          type="register"
          onSubmit={handleSignUp}
          isLoading={isLoading}
        />
      </motion.div>

      <motion.div variants={item} className="text-center text-sm">
        <Link
          href="/login"
          className="text-muted-foreground hover:text-primary underline underline-offset-4"
        >
          Already have an account? Sign In
        </Link>
      </motion.div>
    </motion.div>
  )
}
