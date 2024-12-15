import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabaseClient } from '@/lib/supabase/client'
import {
  MAX_ATTEMPTS,
  LOCKOUT_TIME,
  getSecurityState,
  saveSecurityState,
} from '../utils/security'

interface UseOtpVerificationProps {
  onShake: () => void
}

export const useOtpVerification = ({ onShake }: UseOtpVerificationProps) => {
  const [error, setError] = useState<Error | null>(null)
  const [success, setSuccess] = useState<string>('')
  const [isVerifying, setIsVerifying] = useState<boolean>(false)
  const [cooldown, setCooldown] = useState<number>(0)
  const router = useRouter()
  const searchParams = useSearchParams()

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

  // Handle resend cooldown
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

  const handleResendCode = async () => {
    setError(null)
    setSuccess('')
    try {
      const email = searchParams.get('email')
      if (!email) {
        throw new Error('Email is required')
      }

      const { error: resendError } = await supabaseClient.auth.signInWithOtp({
        email: decodeURIComponent(email),
      })

      if (resendError) {
        throw resendError
      }

      setSuccess('A new verification code has been sent to your email')
      setCooldown(60)
    } catch (err) {
      console.error('Failed to resend code:', err)
      const error =
        err instanceof Error ? err : new Error('Failed to resend code')
      setError(error)
    }
  }

  const handleVerifyCode = async (code: string) => {
    if (lockoutTimer > 0) {
      setError(
        new Error(
          `Too many attempts. Please try again in ${lockoutTimer} seconds`,
        ),
      )
      onShake()
      return
    }

    setIsVerifying(true)
    setError(null)
    setSuccess('')

    try {
      const params = {
        type: searchParams.get('type') || 'signup',
        email: searchParams.get('email'),
      } as const

      if (!params.email) {
        throw new Error('Email is required')
      }

      const { error: verifyError } = await supabaseClient.auth.verifyOtp({
        type: params.type as 'signup' | 'recovery' | 'invite',
        email: decodeURIComponent(params.email),
        token: code,
      })

      if (verifyError) {
        throw verifyError
      }

      // Reset attempts on success
      setAttempts(0)
      saveSecurityState({
        attempts: 0,
        lockoutTimer: 0,
        lastAttempt: Date.now(),
      })

      router.push('/dashboard')
    } catch (err) {
      console.error('Failed to verify code:', err)
      const error =
        err instanceof Error ? err : new Error('Verification failed')
      setError(error)

      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      onShake()

      if (newAttempts >= MAX_ATTEMPTS) {
        setLockoutTimer(LOCKOUT_TIME)
        setError(
          new Error(
            `Too many failed attempts. Please try again in ${LOCKOUT_TIME} seconds`,
          ),
        )
        saveSecurityState({
          attempts: newAttempts,
          lockoutTimer: LOCKOUT_TIME,
          lastAttempt: Date.now(),
        })
      } else {
        saveSecurityState({
          attempts: newAttempts,
          lockoutTimer: 0,
          lastAttempt: Date.now(),
        })
      }
    } finally {
      setIsVerifying(false)
    }
  }

  return {
    error,
    success,
    isVerifying,
    cooldown,
    attempts,
    lockoutTimer,
    handleResendCode,
    handleVerifyCode,
  }
}
