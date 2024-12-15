'use client'

import { useTheme } from '@/features/theme/hooks/use-theme'
import { Settings, X } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useState } from 'react'
import { themes } from '../config/themes'
import { cn } from '@/lib/utils'

type FloatingThemeSelectorProps = {
  position?: 'left' | 'right'
}

export const FloatingThemeSelector = ({
  position = 'right',
}: FloatingThemeSelectorProps) => {
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  const sidePosition = position === 'left' ? 'left-4' : 'right-4'
  const panelPosition = position === 'left' ? 'left-12' : 'right-12'
  const slideAnimation = position === 'left' ? { x: -20 } : { x: 20 }

  return (
    <div className={cn('fixed top-1/3 -translate-y-1/2 z-50', sidePosition)}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, ...slideAnimation }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, ...slideAnimation }}
            className={cn(
              'absolute bg-background border rounded-lg p-4 shadow-lg w-[280px]',
              panelPosition,
            )}
          >
            <div className="grid grid-cols-3 gap-2">
              {themes.map((themeConfig) => (
                <button
                  key={themeConfig.id}
                  onClick={() => setTheme(themeConfig.id)}
                  className={cn(
                    'w-full aspect-square rounded-md border-2 transition-all duration-200 hover:scale-105',
                    theme === themeConfig.id
                      ? 'border-primary'
                      : 'border-muted',
                  )}
                >
                  <div
                    className={`w-full h-full rounded flex items-center justify-center ${themeConfig.cssClass}`}
                    style={{
                      backgroundColor: 'hsl(var(--background))',
                      color: 'hsl(var(--foreground))',
                    }}
                  >
                    <themeConfig.icon
                      className="w-5 h-5"
                      style={{
                        color: 'hsl(var(--primary))',
                      }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-lg bg-background border shadow-lg flex items-center justify-center hover:bg-accent transition-colors duration-200"
        style={{
          backgroundColor: 'hsl(var(--background))',
          color: 'hsl(var(--foreground))',
          borderColor: 'hsl(var(--border))',
        }}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
      </button>
    </div>
  )
}
