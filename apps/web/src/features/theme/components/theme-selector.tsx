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
          className="grid grid-cols-3 gap-4"
        >
          {themes.map((themeConfig) => {
            const Icon = themeConfig.icon
            return (
              <Label
                key={themeConfig.id}
                htmlFor={themeConfig.id}
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
              >
                <RadioGroupItem
                  value={themeConfig.id}
                  id={themeConfig.id}
                  className="sr-only"
                />
                <Icon className="mb-3 h-6 w-6" />
                <span className="text-sm font-medium">{themeConfig.name}</span>
              </Label>
            )
          })}
        </RadioGroup>
      </CardContent>
    </Card>
  )
}
