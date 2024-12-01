'use client'

import { animate } from 'motion/react'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

const SPRING_CONFIG = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
  restDelta: 0.001,
} as const

export const RouteProgressBar = (): JSX.Element => {
  const pathname = usePathname()
  const progressRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = progressRef.current
    if (!element) return

    // Reset the progress bar

    const controls = animate(
      element,
      {
        opacity: [1, 1],
        scaleX: [0, 1],
        transformOrigin: 'left',
      },
      SPRING_CONFIG,
    )

    controls.then(() => {
      animate(
        element,
        {
          opacity: 0,
        },
        {
          duration: 0.15,
          ease: 'easeOut',
        },
      )
    })

    return () => controls.stop()
  }, [pathname])

  return (
    <div
      ref={progressRef}
      style={{
        background:
          'linear-gradient(90deg, var(--chart-1) 0%, var(--chart-2) 50%, var(--chart-3) 100%)',
        transform: 'scaleX(0)',
        height: '4px',
      }}
      className="fixed top-0 z-20 w-full"
    />
  )
}
