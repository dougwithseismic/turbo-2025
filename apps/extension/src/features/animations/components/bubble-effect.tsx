import { AnimatePresence, motion } from "framer-motion"

const colors = [
  "#ff0000",
  "#ff8000",
  "#ffff00",
  "#00ff00",
  "#0000ff",
  "#8000ff"
]

type BubbleEffectProps = {
  showCustomCursor: boolean
  cursorPosition: { x: number; y: number }
  bubbles: Array<{ id: number; color: string; x: number; y: number }>
  onBubblesComplete: () => void
}

export const BubbleEffect = ({
  showCustomCursor,
  cursorPosition,
  bubbles,
  onBubblesComplete
}: BubbleEffectProps) => {
  return (
    <>
      <AnimatePresence>
        {showCustomCursor && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{
              scale: 1,
              backgroundColor: colors,
              transition: {
                backgroundColor: {
                  repeat: Infinity,
                  duration: 2,
                  ease: "linear"
                }
              }
            }}
            exit={{ scale: 0 }}
            style={{
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              position: "fixed",
              left: cursorPosition.x,
              top: cursorPosition.y,
              pointerEvents: "none",
              zIndex: 9999,
              transform: "translate(-50%, -50%)"
            }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {bubbles.map((bubble) => (
          <motion.div
            key={bubble.id}
            initial={{
              scale: 0.2,
              opacity: 1,
              x: bubble.x,
              y: bubble.y
            }}
            animate={{
              scale: 1,
              opacity: 0,
              x: bubble.x + (Math.random() - 0.5) * 100,
              y: bubble.y - Math.random() * 100
            }}
            exit={{ scale: 0 }}
            transition={{
              duration: 0.6,
              ease: "easeOut"
            }}
            onAnimationComplete={onBubblesComplete}
            style={{
              position: "fixed",
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: bubble.color,
              pointerEvents: "none",
              zIndex: 9999,
              transform: "translate(-50%, -50%)"
            }}
          />
        ))}
      </AnimatePresence>
    </>
  )
}
