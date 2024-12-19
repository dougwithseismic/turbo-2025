import cssText from "data-text:~style.css"
import { AnimatePresence, motion } from "framer-motion"
import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useRef, useState } from "react"

import { BubbleEffect } from "~features/animations/components/bubble-effect"
import { useBubbleEffect } from "~features/animations/hooks/use-bubble-effect"

// This is how we inject the CSS into a content script page
export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

export const config: PlasmoCSConfig = {
  matches: ["https://turbo-2025.vercel.app/*"],
  run_at: "document_start"
}

window.addEventListener("load", () => {
  console.log("content script loaded")
})

const FloatingFeedbackButton = () => {
  const FEEDBACK_QUESTION = "How can we improve Turbo 2025?"
  const [isExpanded, setIsExpanded] = useState(false)
  const [feedbackText, setFeedbackText] = useState("")
  const [submitState, setSubmitState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const {
    bubbles,
    showCustomCursor,
    cursorPosition,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave,
    handleClick,
    handleBubblesComplete,
    hideCustomCursor
  } = useBubbleEffect()

  const toggleExpanded = () => {
    setIsExpanded((prev) => {
      if (!prev) {
        hideCustomCursor()
      }
      return !prev
    })
  }

  const handleClose = () => {
    hideCustomCursor()
    setIsExpanded(false)
    setSubmitState("idle")
  }

  const handleSubmitFeedback = async (e: React.MouseEvent) => {
    setSubmitState("loading")

    try {
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate random success/failure
          Math.random() > 0.3
            ? resolve(null)
            : reject(new Error("Failed to submit feedback"))
        }, 1500)
      })

      setSubmitState("success")
      setFeedbackText("")
      handleClick(e)
      setTimeout(handleClose, 1000)
    } catch (err) {
      setSubmitState("error")
      setTimeout(() => setSubmitState("idle"), 2000)
    }
  }

  useEffect(() => {
    if (isExpanded && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isExpanded])

  return (
    <>
      <BubbleEffect
        showCustomCursor={showCustomCursor}
        cursorPosition={cursorPosition}
        bubbles={bubbles}
        onBubblesComplete={handleBubblesComplete}
      />
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={handleClose}
          />
        )}
      </AnimatePresence>
      <div
        className="fixed top-1/3 left-4 flex items-start gap-2 z-50"
        onMouseMove={handleMouseMove}>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="expand-button bg-primary text-primary-foreground p-3 rounded-md hover:bg-accent [&:hover]:cursor-none"
          onClick={toggleExpanded}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}>
          💭
        </motion.button>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-card p-4 rounded-md shadow-lg z-50"
              ref={containerRef}>
              <motion.textarea
                initial={{ height: 0 }}
                animate={{ height: "6rem" }}
                transition={{ duration: 0.2 }}
                ref={textareaRef}
                className="w-full h-24 p-2 text-sm bg-background text-foreground rounded-md resize-none"
                placeholder={FEEDBACK_QUESTION}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                disabled={submitState === "loading"}
              />
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex justify-end mt-2 gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-md"
                  onClick={handleClose}
                  disabled={submitState === "loading"}>
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`grid place-items-center w-20 px-3 py-1 text-sm rounded-md ${
                    submitState === "error"
                      ? "bg-destructive text-destructive-foreground"
                      : submitState === "success"
                        ? "bg-success text-success-foreground"
                        : feedbackText.length === 0
                          ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                          : "bg-primary text-primary-foreground"
                  } ${submitState === "loading" ? "cursor-wait" : ""}`}
                  onClick={handleSubmitFeedback}
                  disabled={
                    submitState === "loading" ||
                    submitState === "success" ||
                    feedbackText.length === 0
                  }>
                  {submitState === "loading"
                    ? "Sending..."
                    : submitState === "success"
                      ? "Sent! ✓"
                      : submitState === "error"
                        ? "Failed!"
                        : "Submit"}
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}

export default FloatingFeedbackButton
