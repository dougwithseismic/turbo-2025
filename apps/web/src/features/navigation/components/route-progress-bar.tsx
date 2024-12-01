'use client'

import { animate } from 'motion/react'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

const PROGRESS_DURATION = 0.3
const FADE_DURATION = 0.3

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
      },
      {
        duration: PROGRESS_DURATION,
        ease: [0.43, 0.13, 0.23, 0.96], // Custom easing curve for smoother motion
      },
    )

    controls.then(() => {
      animate(
        element,
        {
          opacity: 0,
        },
        {
          duration: FADE_DURATION,
          ease: [0.4, 0, 0.2, 1], // Smooth ease out for fade
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
        transformOrigin: 'left',
      }}
      className="fixed top-0 z-20 w-full"
    />
  )
}
