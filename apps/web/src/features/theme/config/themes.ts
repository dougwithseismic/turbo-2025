import { type LucideIcon, Sun, Moon, Coffee, Palette } from 'lucide-react'

export interface ThemeConfig {
  name: string
  id: string
  icon: LucideIcon
  colorScheme: 'light' | 'dark'
  themeColor: string
  cssClass: string
}

export const themes: ThemeConfig[] = [
  {
    name: 'Light',
    id: 'light',
    icon: Sun,
    colorScheme: 'light',
    themeColor: 'white',
    cssClass: 'light',
  },
  {
    name: 'Dark',
    id: 'dark',
    icon: Moon,
    colorScheme: 'dark',
    themeColor: '#0D0B14',
    cssClass: 'dark',
  },
  {
    name: 'Coffee',
    id: 'coffee',
    icon: Coffee,
    colorScheme: 'light',
    themeColor: '#0D0B14',
    cssClass: 'coffee',
  },
  {
    name: 'Pastel',
    id: 'pastel',
    icon: Palette,
    colorScheme: 'light',
    themeColor: 'white',
    cssClass: 'pastel',
  },
] as const

export type ThemeId = (typeof themes)[number]['id']
