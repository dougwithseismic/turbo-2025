'use client'

import { Button } from '@/components/ui/button'
import { useTheme } from '@/features/theme/hooks/use-theme'
import { themes } from '../config/themes'
import { useEffect, useState } from 'react'

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (themes.length === 0) return null

  const cycleTheme = () => {
    const currentIndex = themes.findIndex((t) => t.id === theme)
    const nextIndex = (currentIndex + 1) % themes.length
    if (!themes[nextIndex]) return

    setTheme(themes[nextIndex].id)
  }

  const currentTheme = themes.find((t) => t.id === theme)
  if (!currentTheme) return null

  const Icon = currentTheme.icon

  if (!mounted) {
    return null
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="fixed right-4 top-4 z-50"
      onClick={cycleTheme}
    >
      <Icon className="h-[1.2rem] w-[1.2rem]" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
