import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'motion/react'
import { Check, Loader2 } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useDragToConfirm } from '../hooks/use-drag-to-confirm'
import { useId } from 'react'

type DragToConfirmProps = {
  onConfirm: () => Promise<boolean>
  disabled?: boolean
  className?: string
  label?: string
  ariaLabel?: string
}

export const DragToConfirm = ({
  onConfirm,
  disabled = false,
  className,
  label = 'Swipe to confirm',
  ariaLabel = 'Drag to confirm action',
}: DragToConfirmProps) => {
  const {
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
  } = useDragToConfirm({
    onConfirm,
  })

  const trackId = useId()
  const labelId = useId()
  const descriptionId = useId()
  const progressRef = useRef<HTMLDivElement>(null)

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (disabled || isSubmitting || showSuccess) return

      switch (e.key) {
        case 'ArrowRight':
        case 'Right':
          e.preventDefault()
          if (progressRef.current) {
            const currentValue = dragProgress.get()
            const newValue = Math.min(currentValue + 10, 100)
            x.set((newValue / 100) * dragThreshold)
            if (newValue >= 90) {
              await handleDragEnd()
            }
          }
          break
        case 'ArrowLeft':
        case 'Left':
          e.preventDefault()
          if (progressRef.current) {
            const currentValue = dragProgress.get()
            const newValue = Math.max(currentValue - 10, 0)
            x.set((newValue / 100) * dragThreshold)
          }
          break
        case 'Home':
          e.preventDefault()
          x.set(0)
          break
        case 'End':
          e.preventDefault()
          if (!disabled) {
            x.set(dragThreshold)
            await handleDragEnd()
          }
          break
        case 'Enter':
        case ' ':
          e.preventDefault()
          if (!disabled) {
            x.set(dragThreshold)
            await handleDragEnd()
          }
          break
      }
    }

    const button = buttonRef.current
    if (button) {
      button.addEventListener('keydown', handleKeyDown)
      return () => button.removeEventListener('keydown', handleKeyDown)
    }
  }, [
    disabled,
    isSubmitting,
    showSuccess,
    dragProgress,
    dragThreshold,
    handleDragEnd,
    buttonRef,
    x,
  ])

  const handleDragStart = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10) // Short vibration on drag start
    }
  }

  const handleDrag = () => {
    const progress = dragProgress.get()
    if (progress > 0) {
      // Vibrate with increasing intensity based on progress
      if ('vibrate' in navigator) {
        const vibrationStrength = Math.floor((progress / 100) * 20) + 5 // 5-25ms
        const vibrationCount = Math.floor(progress / 20) + 1 // 1-6 pulses
        const vibrationPattern = Array(vibrationCount).fill(vibrationStrength)
        navigator.vibrate(vibrationPattern)
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      ref={buttonRef}
      role="slider"
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(dragProgress.get())}
      aria-labelledby={labelId}
      aria-describedby={descriptionId}
      aria-disabled={disabled || isSubmitting}
      tabIndex={disabled ? -1 : 0}
      className={cn(
        'relative h-11 w-full rounded-md bg-secondary',
        'overflow-hidden transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        disabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
    >
      <div id={labelId} className="sr-only">
        {label}
      </div>
      <div id={descriptionId} className="sr-only">
        {showSuccess
          ? 'Action confirmed successfully'
          : isSubmitting
            ? 'Processing confirmation'
            : 'Use arrow keys to drag, Enter or Space to confirm'}
      </div>
      <div
        ref={progressRef}
        role="progressbar"
        aria-labelledby={trackId}
        aria-valuenow={Math.round(dragProgress.get())}
        aria-valuemin={0}
        aria-valuemax={100}
        className="absolute inset-0"
      >
        <motion.div
          className="absolute inset-0 origin-left"
          style={{
            scaleX,
            backgroundColor: trackBackground,
          }}
        />
      </div>
      <motion.div
        className="absolute inset-0 flex items-center justify-end px-4"
        style={{ opacity: textOpacity }}
      >
        <span
          id={trackId}
          className="text-sm font-medium text-muted-foreground"
        >
          {label}
        </span>
      </motion.div>
      <motion.div
        drag={!disabled && !isSubmitting && !showSuccess ? 'x' : false}
        dragConstraints={{ left: 0, right: dragThreshold }}
        dragElastic={0.1}
        dragMomentum={false}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{
          x,
          backgroundColor: showSuccess
            ? 'hsl(var(--primary))'
            : backgroundColor,
          boxShadow,
          scale,
        }}
        className={cn(
          'absolute inset-y-0 left-0 w-24 touch-none select-none z-10',
          'flex items-center justify-center rounded-md',
          'bg-primary text-primary-foreground',
          !disabled &&
            !isSubmitting &&
            !showSuccess &&
            'cursor-grab active:cursor-grabbing',
          disabled && 'cursor-not-allowed',
          'transition-colors duration-200',
        )}
      >
        <AnimatePresence mode="wait">
          {isSubmitting ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              <span className="sr-only">Loading</span>
            </motion.div>
          ) : showSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Check
                className="h-5 w-5 text-primary-foreground"
                aria-hidden="true"
              />
              <span className="sr-only">Success</span>
            </motion.div>
          ) : (
            <motion.div key="arrow" className="relative h-5 w-5">
              <motion.svg
                viewBox="0 0 24 24"
                className="absolute inset-0 h-full w-full stroke-current"
                fill="none"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {/* Arrow */}
                <motion.g
                  style={{
                    scale: arrowScale,
                    opacity: iconPathLength,
                    transformOrigin: 'center',
                  }}
                >
                  <motion.path
                    d="M5 12h14M12 5l7 7-7 7"
                    style={{ pathLength: iconPathLength }}
                  />
                </motion.g>

                {/* Success State (Circle + Check combined) */}
                <motion.g
                  style={{
                    opacity: successPathLength,
                    scale: successScale,
                    transformOrigin: 'center',
                  }}
                >
                  <motion.path
                    d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z"
                    style={{ pathLength: successPathLength }}
                  />
                  <motion.path
                    d="M8 12l3 3 6-6"
                    style={{ pathLength: successPathLength }}
                  />
                </motion.g>
              </motion.svg>
              <span className="sr-only">Drag handle</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
