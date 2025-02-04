'use client'

import { useState, useCallback, ReactNode } from 'react'
import Confetti from 'react-confetti'
import { useWindowSize } from './use-window-size'

interface UseConfettiReturn {
  triggerConfetti: () => void
  ConfettiComponent: () => ReactNode | null
  isActive: boolean
}

export const useConfetti = (): UseConfettiReturn => {
  const [isActive, setIsActive] = useState(false)
  const { width, height } = useWindowSize()

  const triggerConfetti = useCallback(() => {
    setIsActive(true)
    setTimeout(() => setIsActive(false), 3000)
  }, [])

  const ConfettiComponent = useCallback(() => {
    if (!isActive) return null

    return (
      <Confetti
        width={width}
        height={height}
        recycle={false}
        numberOfPieces={200}
        gravity={0.3}
      />
    )
  }, [isActive, width, height])

  return {
    triggerConfetti,
    ConfettiComponent,
    isActive,
  }
}
