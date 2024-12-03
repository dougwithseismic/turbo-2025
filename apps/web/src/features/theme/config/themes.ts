import {
  type LucideIcon,
  Sun,
  Moon,
  Coffee,
  Palette,
  Flower,
  Mouse,
} from 'lucide-react'

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
  {
    name: 'Nordic',
    id: 'nordic',
    icon: Palette,
    colorScheme: 'light',
    themeColor: 'white',
    cssClass: 'nordic',
  },
  {
    name: 'Greek',
    id: 'greek',
    icon: Palette,
    colorScheme: 'dark',
    themeColor: 'dark',
    cssClass: 'greek',
  },
  {
    name: 'Purple',
    id: 'purple',
    icon: Palette,
    colorScheme: 'dark',
    themeColor: 'dark',
    cssClass: 'purple',
  },
  {
    name: 'Rose.Light',
    id: 'rose-light',
    icon: Flower,
    colorScheme: 'light',
    themeColor: 'white',
    cssClass: 'rose-light',
  },
  {
    name: 'Rose.Dark',
    id: 'rose-dark',
    icon: Flower,
    colorScheme: 'dark',
    themeColor: 'dark',
    cssClass: 'rose-dark',
  },
  {
    name: 'Contra',
    id: 'contra',
    icon: Palette,
    colorScheme: 'light',
    themeColor: 'light',
    cssClass: 'contra',
  },
  {
    name: 'Cursor',
    id: 'cursor',
    icon: Mouse,
    colorScheme: 'dark',
    themeColor: 'dark',
    cssClass: 'cursor',
  },
  {
    name: 'Parsera',
    id: 'parsera',
    icon: Palette,
    colorScheme: 'dark',
    themeColor: 'dark',
    cssClass: 'parsera',
  },
] as const

export type ThemeId = (typeof themes)[number]['id']
