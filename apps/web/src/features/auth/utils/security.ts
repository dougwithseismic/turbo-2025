import { useState, useEffect } from 'react'
import type { SecurityState } from '../forms/types'

export const MAX_ATTEMPTS = 5
export const LOCKOUT_TIME = process.env.NODE_ENV === 'development' ? 5 : 300 // 5 seconds in dev, 5 minutes in prod
export const STORAGE_KEY = 'auth_security'

export const useSecurityState = () => {
  const getInitialState = (): SecurityState => {
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

    if (timePassed >= LOCKOUT_TIME) {
      localStorage.removeItem(STORAGE_KEY)
      return { attempts: 0, lockoutTimer: 0, lastAttempt: 0 }
    }

    if (state.lockoutTimer > 0) {
      const remainingLockout = Math.max(0, state.lockoutTimer - timePassed)
      return { ...state, lockoutTimer: remainingLockout }
    }

    return state
  }

  const [security, setSecurity] = useState(getInitialState)

  const updateSecurityState = (newState: Partial<SecurityState>) => {
    const updatedState = {
      ...security,
      ...newState,
      lastAttempt: Date.now(),
    }
    setSecurity(updatedState)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedState))
    }
  }

  useEffect(() => {
    if (security.lockoutTimer > 0) {
      const timer = setInterval(() => {
        updateSecurityState({
          lockoutTimer: Math.max(0, security.lockoutTimer - 1),
          attempts: security.lockoutTimer <= 1 ? 0 : security.attempts,
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [security.lockoutTimer, security.attempts])

  return { security, updateSecurityState }
}
