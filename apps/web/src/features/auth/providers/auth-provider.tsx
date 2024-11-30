'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type {
  LoadingState,
  AuthFormData,
  AuthResponse,
  AuthResponseWithSession,
} from '../types'
import { AuthContext } from '../context/auth-context'
import {
  executeSignIn,
  executeSignOut,
  executeSignUp,
  executeResetPasswordRequest,
  executeUpdatePassword,
} from '../actions/auth-actions'

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingState, setLoadingState] = useState<LoadingState>('idle')
  const router = useRouter()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setIsLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (
    data: AuthFormData,
  ): Promise<AuthResponseWithSession> => {
    setLoadingState('progress')
    try {
      const response = await executeSignIn(data)
      if (!response.error) {
        setLoadingState('complete')
        router.push('/dashboard')
      } else {
        setLoadingState('error')
      }
      return response
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (
    data: AuthFormData,
  ): Promise<AuthResponseWithSession> => {
    setLoadingState('progress')
    try {
      const response = await executeSignUp(data)
      if (!response.error) {
        setLoadingState('complete')
        const verifyParams = new URLSearchParams({
          email: encodeURIComponent(data.email),
          type: 'signup',
        })
        router.push(`/auth/verify-request?${verifyParams.toString()}`)
      } else {
        setLoadingState('error')
      }
      return response
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async ({
    redirect = true,
    destinationUrl = '/login',
  } = {}): Promise<AuthResponse> => {
    setLoadingState('progress')
    try {
      const response = await executeSignOut()
      if (!response.error) {
        setLoadingState('complete')
        if (redirect) router.push(destinationUrl)
      } else {
        setLoadingState('error')
      }
      return response
    } finally {
      setIsLoading(false)
    }
  }

  const resetPassword = async ({
    email,
  }: {
    email: string
  }): Promise<AuthResponse> => {
    setLoadingState('progress')
    try {
      const response = await executeResetPasswordRequest({ email })
      if (!response.error) {
        setLoadingState('complete')
      } else {
        setLoadingState('error')
      }
      return response
    } finally {
      setIsLoading(false)
    }
  }

  const updatePassword = async ({
    password,
  }: {
    password: string
  }): Promise<AuthResponse> => {
    setLoadingState('progress')
    try {
      const response = await executeUpdatePassword({ password })
      if (!response.error) {
        setLoadingState('complete')
        router.push('/dashboard')
      } else {
        setLoadingState('error')
      }
      return response
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    user,
    isLoading,
    loadingState,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
