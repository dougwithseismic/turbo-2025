'use client'

import { useTheme as useNextTheme } from 'next-themes'
import { themes } from '../config/themes'

export const useTheme = () => {
  const { theme, setTheme, ...rest } = useNextTheme()

  const availableThemes = themes.map((t) => ({
    id: t.id,
    name: t.name,
    icon: t.icon,
  }))

  return {
    theme,
    setTheme,
    availableThemes,
    ...rest,
  }
}
