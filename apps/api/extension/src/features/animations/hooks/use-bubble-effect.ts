import { useState } from "react"

type BubbleType = {
  id: number
  color: string
  x: number
  y: number
}

type UseBubbleEffectProps = {
  onBubbleComplete?: () => void
}

export const useBubbleEffect = ({
  onBubbleComplete
}: UseBubbleEffectProps = {}) => {
  const [showCustomCursor, setShowCustomCursor] = useState(false)
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
  const [bubbles, setBubbles] = useState<BubbleType[]>([])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (showCustomCursor) {
      setCursorPosition({ x: e.pageX, y: e.pageY })
    }
  }

  const createBubbles = (x: number, y: number) => {
    const numBubbles = Math.floor(Math.random() * 8) + 4 // 4-12 bubbles
    const newBubbles = Array.from({ length: numBubbles }, (_, i) => ({
      id: Date.now() + i,
      color: `hsl(${Math.random() * 360}, 80%, 60%)`,
      x: x + (Math.random() - 0.5) * 40,
      y: y + (Math.random() - 0.5) * 40
    }))
    setBubbles(newBubbles)
  }

  const handleMouseEnter = () => {
    setShowCustomCursor(true)
  }

  const handleMouseLeave = (e: React.MouseEvent) => {
    createBubbles(e.pageX, e.pageY)
    setShowCustomCursor(false)
  }

  const handleClick = (e: React.MouseEvent) => {
    createBubbles(e.pageX, e.pageY)
  }

  const handleBubblesComplete = () => {
    setBubbles([])
    onBubbleComplete?.()
  }

  const hideCustomCursor = () => {
    setShowCustomCursor(false)
  }

  return {
    bubbles,
    showCustomCursor,
    cursorPosition,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave,
    handleClick,
    handleBubblesComplete,
    hideCustomCursor
  }
}
