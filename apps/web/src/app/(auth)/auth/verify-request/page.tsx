'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { motion } from 'motion/react'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabaseClient } from '@/lib/supabase/client'

interface VerifyCodeParams {
  code: string
}

export default function VerifyRequestPage() {
  const [code, setCode] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [isVerifying, setIsVerifying] = useState<boolean>(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleVerifyCode = async ({ code }: VerifyCodeParams) => {
    setIsVerifying(true)
    setError('')
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

      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setCode(value)
  }

  return (
    <div className="container relative flex h-[100vh] flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
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
          <Input
            type="text"
            placeholder="Enter 6-digit code"
            value={code}
            onChange={handleInputChange}
            className="text-center text-lg tracking-widest"
            maxLength={6}
          />

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            className="w-full"
            onClick={() => handleVerifyCode({ code })}
            disabled={code.length !== 6 || isVerifying}
          >
            {isVerifying ? 'Verifying...' : 'Verify Code'}
          </Button>

          <Button asChild variant="outline" className="w-full">
            <Link href="/login">Back to Login</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
