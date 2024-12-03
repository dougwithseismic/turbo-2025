'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import type { AuthFormProps, FormState } from './types'
import { useSecurityState, MAX_ATTEMPTS, LOCKOUT_TIME } from '../utils/security'
import {
  getShakeAnimation,
  getReducedShakeAnimation,
} from '../animations/form-animations'
import { Checkbox } from '@/components/ui/checkbox'

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
