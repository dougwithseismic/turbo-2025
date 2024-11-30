'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { EyeIcon, EyeOffIcon } from 'lucide-react'

interface AuthFormProps {
  type: 'login' | 'register'
  onSubmit: (data: {
    email: string
    password: string
  }) => Promise<{ error: Error | null }>
  isLoading: boolean
}

interface SecurityState {
  attempts: number
  lockoutTimer: number
  lastAttempt: number
}

const MAX_ATTEMPTS = 5
const LOCKOUT_TIME = process.env.NODE_ENV === 'development' ? 5 : 300 // 5 seconds in dev, 5 minutes in prod
const STORAGE_KEY = 'auth_security'

const getShakeAnimation = (
  remainingAttempts: number,
  prefersReduced: boolean,
) => {
  if (prefersReduced) {
    return {
      shake: {
        opacity: [1, 0.7, 1],
        transition: { duration: 0.5 },
      },
    }
  }

  // Intensity increases as attempts decrease
  const intensity = (MAX_ATTEMPTS - remainingAttempts + 1) * 4
  return {
    shake: {
      x: [
        0,
        -intensity,
        intensity,
        -intensity,
        intensity,
        -(intensity / 2),
        intensity / 2,
        -(intensity / 4),
        intensity / 4,
        0,
      ],
      transition: { duration: 0.5 },
    },
  }
}

const getSecurityState = (): SecurityState => {
  if (typeof window === 'undefined') {
    return { attempts: 0, lockoutTimer: 0, lastAttempt: 0 }
  }

  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    return { attempts: 0, lockoutTimer: 0, lastAttempt: 0 }
  }

  const state = JSON.parse(stored) as SecurityState
  const now = Date.now()
  const timePassed = Math.floor((now - state.lastAttempt) / 1000)

  // If more than LOCKOUT_TIME has passed, reset the state
  if (timePassed >= LOCKOUT_TIME) {
    localStorage.removeItem(STORAGE_KEY)
    return { attempts: 0, lockoutTimer: 0, lastAttempt: 0 }
  }

  // If we're still in lockout, calculate remaining time
  if (state.lockoutTimer > 0) {
    const remainingLockout = Math.max(0, state.lockoutTimer - timePassed)
    return {
      ...state,
      lockoutTimer: remainingLockout,
    }
  }

  return state
}

const saveSecurityState = (state: SecurityState): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      ...state,
      lastAttempt: Date.now(),
    }),
  )
}

export function AuthForm({ type, onSubmit, isLoading }: AuthFormProps) {
  const prefersReducedMotion = useReducedMotion()
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [shake, setShake] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Initialize from localStorage
  const [attempts, setAttempts] = useState(() => getSecurityState().attempts)
  const [lockoutTimer, setLockoutTimer] = useState(
    () => getSecurityState().lockoutTimer,
  )

  // Handle lockout timer
  useEffect(() => {
    if (lockoutTimer > 0) {
      const timer = setInterval(() => {
        setLockoutTimer((prevTimer: number) => {
          const newValue = prevTimer <= 1 ? 0 : prevTimer - 1
          // Save state on each tick
          saveSecurityState({
            attempts: newValue === 0 ? 0 : attempts,
            lockoutTimer: newValue,
            lastAttempt: Date.now(),
          })
          if (newValue === 0) setAttempts(0)
          return newValue
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [lockoutTimer, attempts])

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (lockoutTimer > 0) {
      setError(`Too many attempts. Please try again in ${lockoutTimer} seconds`)
      triggerShake()
      return
    }

    try {
      await onSubmit({ email, password })
      setError(null)
      setAttempts(0)
      saveSecurityState({
        attempts: 0,
        lockoutTimer: 0,
        lastAttempt: Date.now(),
      })
    } catch (err) {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      triggerShake()

      if (newAttempts >= MAX_ATTEMPTS) {
        setLockoutTimer(LOCKOUT_TIME)
        setError(
          `Too many failed attempts. Please try again in ${LOCKOUT_TIME} seconds`,
        )
        saveSecurityState({
          attempts: newAttempts,
          lockoutTimer: LOCKOUT_TIME,
          lastAttempt: Date.now(),
        })
      } else {
        setError(err instanceof Error ? err.message : 'An error occurred')
        saveSecurityState({
          attempts: newAttempts,
          lockoutTimer: 0,
          lastAttempt: Date.now(),
        })
      }
    }
  }

  const remainingAttempts = MAX_ATTEMPTS - attempts

  return (
    <motion.form
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 10 }}
      animate={{
        opacity: 1,
        y: 0,
        ...(!shake
          ? {}
          : getShakeAnimation(remainingAttempts, Boolean(prefersReducedMotion))
              .shake),
      }}
      onSubmit={handleSubmit}
      className="grid gap-6"
    >
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, height: prefersReducedMotion ? 'auto' : 0 }}
            animate={{
              opacity: 1,
              height: 'auto',
            }}
            exit={{
              opacity: 0,
              height: prefersReducedMotion ? 'auto' : 0,
            }}
          >
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
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
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading || lockoutTimer > 0}
              className="transition-all duration-200"
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
              placeholder="Password"
              type={showPassword ? 'text' : 'password'}
              autoCapitalize="none"
              autoComplete={
                type === 'login' ? 'current-password' : 'new-password'
              }
              autoCorrect="off"
              name="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading || lockoutTimer > 0}
              className="pr-10 transition-all duration-200"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading || lockoutTimer > 0}
            >
              {showPassword ? (
                <EyeOffIcon className="h-4 w-4 text-muted-foreground" />
              ) : (
                <EyeIcon className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="sr-only">
                {showPassword ? 'Hide password' : 'Show password'}
              </span>
            </Button>
          </motion.div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {attempts > 0 && attempts < MAX_ATTEMPTS && (
          <motion.p
            key="attempts"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-sm text-muted-foreground"
          >
            {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''}{' '}
            remaining
          </motion.p>
        )}
      </AnimatePresence>

      <motion.div whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}>
        <Button
          type="submit"
          disabled={isLoading || lockoutTimer > 0}
          className="w-full"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-current" />
            </div>
          ) : lockoutTimer > 0 ? (
            `Try again in ${lockoutTimer}s`
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
