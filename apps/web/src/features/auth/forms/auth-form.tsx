'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import type { AuthFormProps, FormState } from './types'
import { useSecurityState, MAX_ATTEMPTS, LOCKOUT_TIME } from '../utils/security'
import {
  getShakeAnimation,
  getReducedShakeAnimation,
} from '../animations/form-animations'
import { Checkbox } from '@/components/ui/checkbox'
import { executeGoogleSignIn } from '../actions/auth-actions'
import { clientConfig } from '@/config/app-config'

export function AuthForm({
  type,
  onSubmit,
  isLoading,
  onLockoutChange,
}: AuthFormProps) {
  const prefersReducedMotion = useReducedMotion()
  const { security, updateSecurityState } = useSecurityState()
  const [formState, setFormState] = useState<FormState>({
    email: '',
    password: '',
    showPassword: false,
    error: null,
    shake: false,
    acceptedTerms: false,
  })

  const remainingAttempts = MAX_ATTEMPTS - security.attempts

  // Count enabled auth providers
  const enabledAuthProviders = Object.values(clientConfig.AUTH).filter(
    (provider) => provider.ENABLED,
  ).length

  useEffect(() => {
    onLockoutChange?.(security.lockoutTimer > 0)
  }, [security.lockoutTimer, onLockoutChange])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  const triggerShake = () => {
    setFormState((prev) => ({ ...prev, shake: true }))
    setTimeout(() => setFormState((prev) => ({ ...prev, shake: false })), 500)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (type === 'register' && !formState.acceptedTerms) {
      setFormState((prev) => ({
        ...prev,
        error: 'You must accept the terms and conditions',
      }))
      triggerShake()
      return
    }

    if (security.lockoutTimer > 0) {
      setFormState((prev) => ({
        ...prev,
        error: `Too many attempts. Please try again in ${security.lockoutTimer} seconds`,
      }))
      triggerShake()
      return
    }

    try {
      const result = await onSubmit({
        email: formState.email,
        password: formState.password,
      })

      if (result.error) throw result.error

      updateSecurityState({
        attempts: 0,
        lockoutTimer: 0,
      })
      setFormState((prev) => ({ ...prev, error: null }))
    } catch (err) {
      const newAttempts = security.attempts + 1
      triggerShake()

      if (newAttempts >= MAX_ATTEMPTS) {
        updateSecurityState({
          attempts: newAttempts,
          lockoutTimer: LOCKOUT_TIME,
        })
        setFormState((prev) => ({
          ...prev,
          error: `Too many failed attempts. Please try again in ${LOCKOUT_TIME} seconds`,
        }))
      } else {
        updateSecurityState({ attempts: newAttempts })
        setFormState((prev) => ({
          ...prev,
          error: err instanceof Error ? err.message : 'An error occurred',
        }))
      }
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await executeGoogleSignIn()
      if (error) {
        setFormState((prev) => ({
          ...prev,
          error: error.message,
        }))
        triggerShake()
      }
    } catch (err) {
      setFormState((prev) => ({
        ...prev,
        error:
          err instanceof Error ? err.message : 'Failed to sign in with Google',
      }))
      triggerShake()
    }
  }

  const shakeAnimation = prefersReducedMotion
    ? getReducedShakeAnimation()
    : getShakeAnimation((MAX_ATTEMPTS - remainingAttempts + 1) * 4)

  return (
    <motion.form
      animate={formState.shake ? shakeAnimation.shake : { opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="grid gap-6 dark:text-foreground"
    >
      <AnimatePresence mode="wait">
        {formState.error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, height: prefersReducedMotion ? 'auto' : 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: prefersReducedMotion ? 'auto' : 0 }}
          >
            <Alert variant="destructive" className="bg-secondary-foreground">
              <AlertDescription>{formState.error}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {clientConfig.AUTH.GOOGLE.ENABLED && (
        <motion.div whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}>
          <Button
            type="button"
            variant="outline"
            disabled={isLoading || security.lockoutTimer > 0}
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-2 dark:bg-background dark:text-foreground dark:hover:bg-background/90"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>
        </motion.div>
      )}

      {enabledAuthProviders > 0 && (
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t dark:border-muted" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground dark:bg-background">
              Or continue with email
            </span>
          </div>
        </div>
      )}

      <div className="grid gap-2">
        <div className="grid gap-1">
          <Label className="sr-only" htmlFor="email">
            Email
          </Label>
          <motion.div whileTap={prefersReducedMotion ? {} : { scale: 0.995 }}>
            <Input
              id="email"
              name="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              required
              value={formState.email}
              onChange={handleInputChange}
              disabled={isLoading || security.lockoutTimer > 0}
              className="transition-all duration-200 dark:bg-background dark:text-foreground dark:border-input"
            />
          </motion.div>
        </div>

        <div className="grid gap-1">
          <Label className="sr-only" htmlFor="password">
            Password
          </Label>
          <motion.div whileTap={{ scale: 0.995 }} className="relative">
            <Input
              id="password"
              name="password"
              placeholder="Password"
              type={formState.showPassword ? 'text' : 'password'}
              autoCapitalize="none"
              autoComplete={
                type === 'login' ? 'current-password' : 'new-password'
              }
              autoCorrect="off"
              required
              value={formState.password}
              onChange={handleInputChange}
              disabled={isLoading || security.lockoutTimer > 0}
              className="pr-10 transition-all duration-200 dark:bg-background dark:text-foreground dark:border-input"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent dark:hover:bg-background/10"
              onClick={() =>
                setFormState((prev) => ({
                  ...prev,
                  showPassword: !prev.showPassword,
                }))
              }
              disabled={isLoading || security.lockoutTimer > 0}
            >
              {formState.showPassword ? (
                <EyeOffIcon className="h-4 w-4 text-muted-foreground dark:text-muted-foreground" />
              ) : (
                <EyeIcon className="h-4 w-4 text-muted-foreground dark:text-muted-foreground" />
              )}
              <span className="sr-only">
                {formState.showPassword ? 'Hide password' : 'Show password'}
              </span>
            </Button>
          </motion.div>
        </div>
      </div>

      {type === 'register' && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="terms"
            checked={formState.acceptedTerms}
            onCheckedChange={(checked) =>
              setFormState((prev) => ({ ...prev, acceptedTerms: !!checked }))
            }
          />
          <Label
            htmlFor="terms"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I accept the terms and conditions
          </Label>
        </div>
      )}

      <AnimatePresence mode="wait">
        {security.attempts > 0 && security.attempts < MAX_ATTEMPTS && (
          <motion.p
            key="attempts"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-sm text-muted-foreground dark:text-muted-foreground"
          >
            {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''}{' '}
            remaining
          </motion.p>
        )}
      </AnimatePresence>

      <motion.div whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}>
        <Button
          type="submit"
          disabled={isLoading || security.lockoutTimer > 0}
          className="w-full dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-current" />
            </div>
          ) : security.lockoutTimer > 0 ? (
            `Try again in ${security.lockoutTimer}s`
          ) : type === 'login' ? (
            'Sign In'
          ) : (
            'Sign Up'
          )}
        </Button>
      </motion.div>
    </motion.form>
  )
}
