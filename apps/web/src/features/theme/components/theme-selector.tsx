'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useTheme } from '@/features/theme/hooks/use-theme'
import { Palette } from 'lucide-react'
import { themes } from '../config/themes'

export const ThemeSelector = () => {
  const { theme, setTheme } = useTheme()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          <CardTitle>Appearance</CardTitle>
        </div>
        <CardDescription>
          Customize how the app looks on your device
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={theme}
          onValueChange={setTheme}
          className="grid grid-cols-6 gap-4"
        >
          {[...themes]
            .sort((a, b) => {
              if (a.colorScheme === b.colorScheme) return 0
              return a.colorScheme === 'dark' ? -1 : 1
            })
            .map((themeConfig) => {
              const Icon = themeConfig.icon
              return (
                <div
                  key={themeConfig.id}
                  onClick={() => setTheme(themeConfig.id)}
                  className={`aspect-square select-none h-full w-full flex flex-col items-center justify-center gap-3 rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground hover:border-primary transition-all duration-200 [&:has([data-state=checked])]:border-primary ${themeConfig.id}`}
                  style={{
                    backgroundColor: 'var(--background)',
                    color: 'var(--foreground)',
                  }}
                >
                  <RadioGroupItem
                    value={themeConfig.id}
                    id={themeConfig.id}
                    className="sr-only"
                  />
                  <Icon
                    className="h-6 w-6 transition-colors duration-200"
                    style={{
                      color: 'var(--primary)',
                    }}
                  />
                  <span
                    className="text-sm font-medium transition-colors duration-200"
                    style={{
                      color: 'var(--sidebar-foreground)',
                    }}
                  >
                    {themeConfig.name}
                  </span>
                </div>
              )
            })}
        </RadioGroup>
      </CardContent>
    </Card>
  )
}
