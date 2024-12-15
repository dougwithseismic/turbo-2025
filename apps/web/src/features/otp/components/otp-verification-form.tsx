'use client'

import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { OtpInput } from '@/components/ui/otp-input'
import { getErrorConfig } from '@/lib/errors'
import { useOtpVerification } from '../hooks/use-otp-verification'
import { getShakeAnimation } from '../utils/animations'
import { MAX_ATTEMPTS } from '../utils/security'

export const OtpVerificationForm = () => {
  const prefersReducedMotion = useReducedMotion()
  const [code, setCode] = useState<string>('')
  const [shake, setShake] = useState(false)

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  const {
    error,
    success,
    isVerifying,
    cooldown,
    attempts,
    lockoutTimer,
    handleResendCode,
    handleVerifyCode,
  } = useOtpVerification({
    onShake: triggerShake,
  })

  const remainingAttempts = MAX_ATTEMPTS - attempts

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{
        opacity: 1,
        y: 0,
        ...(!shake
          ? {}
          : getShakeAnimation(remainingAttempts, Boolean(prefersReducedMotion))
              .shake),
      }}
      className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]"
    >
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Enter verification code
        </h1>
        <p className="text-sm text-muted-foreground">
          Please enter the 6-digit code sent to your email
        </p>
      </div>

      <div className="space-y-4">
        <OtpInput
          value={code}
          onChange={setCode}
          disabled={isVerifying || lockoutTimer > 0}
        />

        {error &&
          (() => {
            const errorConfig = getErrorConfig(error)
            return (
              <Alert
                variant={errorConfig.variant}
                className="animate-in fade-in-50"
              >
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

        {success && (
          <Alert className="animate-in fade-in-50">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {attempts > 0 && attempts < MAX_ATTEMPTS && (
          <p className="text-sm text-muted-foreground">
            {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''}{' '}
            remaining
          </p>
        )}

        <Button
          className="w-full"
          onClick={() => handleVerifyCode(code)}
          disabled={code.length !== 6 || isVerifying || lockoutTimer > 0}
        >
          {isVerifying ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-current" />
            </div>
          ) : lockoutTimer > 0 ? (
            `Try again in ${lockoutTimer}s`
          ) : (
            'Verify Code'
          )}
        </Button>

        <Button
          variant="ghost"
          className="w-full"
          onClick={handleResendCode}
          disabled={cooldown > 0 || lockoutTimer > 0}
        >
          {cooldown > 0
            ? `Send magic signin link (${cooldown}s)`
            : "Didn't receive the code? Send magic signin link"}
        </Button>

        <Button asChild variant="outline" className="w-full">
          <Link href="/login">Back to Login</Link>
        </Button>
      </div>
    </motion.div>
  )
}
