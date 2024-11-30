export const MAX_ATTEMPTS = 5
export const LOCKOUT_TIME = process.env.NODE_ENV === 'development' ? 5 : 300 // 5 seconds in dev, 5 minutes in prod
export const STORAGE_KEY = 'otp_security'

export interface SecurityState {
  attempts: number
  lockoutTimer: number
  lastAttempt: number
}

export const getSecurityState = (): SecurityState => {
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
    return {
      ...state,
      lockoutTimer: remainingLockout,
    }
  }

  return state
}

export const saveSecurityState = (state: SecurityState): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      ...state,
      lastAttempt: Date.now(),
    }),
  )
}
