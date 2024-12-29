'use client'

import { useState, useCallback, useEffect } from 'react'

export type HealthCheckState = 'checking' | 'maintenance' | 'restored'

interface UseHealthCheckOptions {
  baseInterval?: number
  maxInterval?: number
  backoffFactor?: number
}

interface HealthCheckStatus {
  state: HealthCheckState
  checkCount: number
  nextCheckIn: number
}

export const useHealthCheck = ({
  baseInterval = 5000,
  maxInterval = 30000,
  backoffFactor = 1.5,
}: UseHealthCheckOptions = {}): [HealthCheckStatus, () => Promise<void>] => {
  const [state, setState] = useState<HealthCheckState>('maintenance')
  const [checkCount, setCheckCount] = useState(0)
  const [currentInterval, setCurrentInterval] = useState(baseInterval)
  const [nextCheckIn, setNextCheckIn] = useState(baseInterval)

  const checkHealth = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/health')
      const data = (await response.json()) as { isHealthy: boolean }
      return data.isHealthy
    } catch (error) {
      console.error('Health check failed:', error)
      return false
    }
  }, [])

  const performHealthCheck = useCallback(async () => {
    if (state === 'checking' || state === 'restored') return

    setState('checking')
    const isHealthy = await checkHealth()

    if (isHealthy) {
      setState('restored')
      return
    }

    setState('maintenance')
    setCheckCount((prev) => prev + 1)
    setCurrentInterval((prev) => {
      const next = prev * backoffFactor
      return Math.min(next, maxInterval)
    })
  }, [state, checkHealth, backoffFactor, maxInterval])

  // Setup automatic health check with exponential backoff
  useEffect(() => {
    if (state === 'restored') return

    // Schedule next check
    const timeoutId = setTimeout(performHealthCheck, currentInterval)

    // Update the countdown timer
    setNextCheckIn(currentInterval)
    const intervalId = setInterval(() => {
      setNextCheckIn((prev) => Math.max(0, prev - 1000))
    }, 1000)

    return () => {
      clearTimeout(timeoutId)
      clearInterval(intervalId)
    }
  }, [currentInterval, performHealthCheck, state])

  const manualCheck = useCallback(async () => {
    setCurrentInterval(baseInterval) // Reset interval on manual check
    await performHealthCheck()
  }, [baseInterval, performHealthCheck])

  return [
    {
      state,
      checkCount,
      nextCheckIn,
    },
    manualCheck,
  ]
}
