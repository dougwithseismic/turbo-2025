'use client'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { motion } from 'motion/react'
import Link from 'next/link'
import { useState } from 'react'
import { container, item } from '../animations/form-animations'
import { AuthForm } from '../forms/auth-form'
import type { AuthSubmitParams, AuthSubmitResult } from '../forms/types'

export function LoginForm() {
  const { signIn, isLoading } = useAuth()
  const [isLockedOut, setIsLockedOut] = useState(false)

  const handleSignIn = async ({
    email,
    password,
  }: AuthSubmitParams): Promise<AuthSubmitResult> => {
    try {
      const result = await signIn({ email, password })
      return result
    } catch (err) {
      console.error('Failed to sign in:', err)
      const error = err instanceof Error ? err : new Error('Failed to sign in')
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
          Welcome back
        </motion.h1>
        <motion.p className="text-sm text-muted-foreground">
          Enter your email to sign in to your account
        </motion.p>
      </motion.div>

      <motion.div variants={item}>
        <AuthForm
          type="login"
          onSubmit={handleSignIn}
          isLoading={isLoading}
          onLockoutChange={setIsLockedOut}
        />
      </motion.div>

      <motion.div
        variants={item}
        className="flex flex-col space-y-2 text-center text-sm"
      >
        {isLockedOut ? (
          <Button variant="default" className="w-full" asChild>
            <Link href="/auth/reset-password">Reset Your Password</Link>
          </Button>
        ) : (
          <Link
            href="/auth/reset-password"
            className="text-muted-foreground hover:text-primary underline underline-offset-4"
          >
            Forgot your password?
          </Link>
        )}
        <Link
          href="/register"
          className="text-muted-foreground hover:text-primary underline underline-offset-4"
        >
          Don&apos;t have an account? Sign Up
        </Link>
      </motion.div>
    </motion.div>
  )
}
