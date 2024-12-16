import {
  useAnimation,
  useMotionValue,
  useTransform,
  MotionValue,
} from 'motion/react'
import { useEffect, useRef, useState } from 'react'

type UseDragToConfirmProps = {
  onConfirm: () => Promise<boolean>
  dragThresholdPercentage?: number
}

type UseDragToConfirmReturn = {
  x: MotionValue<number>
  controls: ReturnType<typeof useAnimation>
  buttonRef: React.RefObject<HTMLDivElement | null>
  dragThreshold: number
  showSuccess: boolean
  isSubmitting: boolean
  dragProgress: MotionValue<number>
  scaleX: MotionValue<number>
  scale: MotionValue<number>
  backgroundColor: MotionValue<string>
  trackBackground: MotionValue<string>
  boxShadow: MotionValue<string>
  textOpacity: MotionValue<number>
  iconPathLength: MotionValue<number>
  successPathLength: MotionValue<number>
  arrowScale: MotionValue<number>
  successScale: MotionValue<number>
  handleDragEnd: () => Promise<void>
  reset: () => void
}

export const useDragToConfirm = ({
  onConfirm,
  dragThresholdPercentage = 0.9,
}: UseDragToConfirmProps): UseDragToConfirmReturn => {
  const controls = useAnimation()
  const x = useMotionValue(0)
  const buttonRef = useRef<HTMLDivElement | null>(null)
  const [dragThreshold, setDragThreshold] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const updateThreshold = () => {
      if (buttonRef.current) {
        const containerWidth = buttonRef.current.offsetWidth
        const buttonWidth = containerWidth / 5 // w-24 = 6rem = 96px
        setDragThreshold(containerWidth - buttonWidth)
      }
    }

    updateThreshold()
    window.addEventListener('resize', updateThreshold)
    return (): void => window.removeEventListener('resize', updateThreshold)
  }, [])

  const dragProgress = useTransform(x, [0, dragThreshold], [0, 100])
  const scaleX = useTransform(dragProgress, [0, 100], [0, 1])
  const scale = useTransform(dragProgress, [0, 100], [1, 1.1])

  const backgroundColor = useTransform(
    dragProgress,
    [0, 50, 100],
    [
      'hsl(var(--primary))',
      'hsl(var(--primary) / 1.1)',
      'hsl(var(--primary) / 1.2)',
    ],
  )

  const trackBackground = useTransform(
    dragProgress,
    [0, 50, 100],
    [
      'hsl(var(--primary) / 0.1)',
      'hsl(var(--primary) / 0.15)',
      'hsl(var(--primary) / 0.2)',
    ],
  )

  const boxShadow = useTransform(
    dragProgress,
    [0, 50, 100],
    [
      '0 0 0 0 hsl(var(--primary) / 0)',
      '0 0 20px 2px hsl(var(--primary) / 0.2)',
      '0 0 30px 4px hsl(var(--primary) / 0.4)',
    ],
  )

  const textOpacity = useTransform(dragProgress, [0, 100], [1, 0])

  const iconPathLength = useMotionValue(0)
  const successPathLength = useMotionValue(0)

  const arrowScale = useTransform(
    dragProgress,
    [0, 45, 50], // Scale up between 45-50%
    [1, 1.5, 0], // Normal → 1.5x → disappear
  )

  const successScale = useTransform(
    dragProgress,
    [50, 55], // Quick scale in after arrow
    [0.8, 1], // Start small → normal size
  )

  useEffect(() => {
    const unsubscribe = dragProgress.onChange((value) => {
      if (value <= 50) {
        // First half: Just show arrow
        iconPathLength.set(1)
        successPathLength.set(0)
      } else {
        // Second half: Arrow disappears, circle and check appear together
        iconPathLength.set(0)
        successPathLength.set((value - 50) / 50)
      }
    })

    return () => unsubscribe()
  }, [dragProgress, iconPathLength, successPathLength])

  const reset = () => {
    x.set(0)
    controls.set({ x: 0 })
    setShowSuccess(false)
    setIsSubmitting(false)
    iconPathLength.set(0)
    successPathLength.set(0)
  }

  const handleDragEnd = async () => {
    const dragValue = x.get()
    if (dragValue > dragThreshold * dragThresholdPercentage) {
      try {
        setIsSubmitting(true)
        // Animate to the end first
        await controls.start({ x: dragThreshold })

        // Call onConfirm and wait for the result
        const success = await onConfirm()

        if (success) {
          // Show success state
          setShowSuccess(true)

          // Wait 500ms then close
          await new Promise((resolve) => setTimeout(resolve, 500))
        }

        // Spring back to start
        void controls.start({
          x: 0,
          transition: { type: 'spring', stiffness: 400, damping: 40 },
        })
      } catch (err) {
        // On error, just spring back
        void controls.start({
          x: 0,
          transition: { type: 'spring', stiffness: 400, damping: 40 },
        })
      } finally {
        setIsSubmitting(false)

        reset()
      }
    } else {
      // Not dragged far enough, spring back
      void controls.start({
        x: 0,
        transition: { type: 'spring', stiffness: 400, damping: 40 },
      })
    }
  }

  return {
    x,
    controls,
    buttonRef,
    dragThreshold,
    showSuccess,
    isSubmitting,
    dragProgress,
    scaleX,
    scale,
    backgroundColor,
    trackBackground,
    boxShadow,
    textOpacity,
    iconPathLength,
    successPathLength,
    arrowScale,
    successScale,
    handleDragEnd,
    reset,
  }
}
