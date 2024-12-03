'use client'

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useTheme } from '@/features/theme/hooks/use-theme'
import { Palette } from 'lucide-react'
import { themes } from '../config/themes'

export const ThemeSelector = () => {
  const { theme, setTheme } = useTheme()

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          <h3 className="font-semibold leading-none tracking-tight">
            Appearance
          </h3>
        </div>
        <p className="text-sm text-muted-foreground mt-1.5">
          Customize how the app looks on your device
        </p>
      </div>
      <div>
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
                  className={`aspect-square select-none h-full w-full flex flex-col items-center justify-center gap-3 rounded-sm border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground hover:border-primary transition-all duration-200 [&:has([data-state=checked])]:border-primary ${themeConfig.id}`}
                  style={{
                    backgroundColor: 'hsl(var(--background))',
                    color: 'hsl(var(--foreground))',
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
                      color: 'hsl(var(--primary))',
                    }}
                  />
                  <span
                    className="text-sm font-medium transition-colors duration-200"
                    style={{
                      color: 'hsl(var(--sidebar-foreground))',
                    }}
                  >
                    {themeConfig.name}
                  </span>
                </div>
              )
            })}
        </RadioGroup>
      </div>
    </div>
  )
}
