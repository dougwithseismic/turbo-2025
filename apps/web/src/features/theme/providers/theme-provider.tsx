'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes'
import { themes } from '../config/themes'
import { useEffect } from 'react'

export const ThemeProvider = ({ children, ...props }: ThemeProviderProps) => {
  useEffect(() => {
    const updateColorScheme = () => {
      const htmlElement = document.documentElement
      const currentTheme = htmlElement.classList[0]
      const themeConfig = themes.find((theme) => theme.id === currentTheme)

      htmlElement.style.colorScheme = themeConfig?.colorScheme ?? 'light'
    }

    // Initial update
    updateColorScheme()

    // Create observer for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          updateColorScheme()
        }
      })
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [])

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="cursor"
      enableSystem
      disableTransitionOnChange
      forcedTheme={undefined}
      value={Object.fromEntries(themes.map((theme) => [theme.id, theme.id]))}
      themes={themes.map((theme) => theme.id)}
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
