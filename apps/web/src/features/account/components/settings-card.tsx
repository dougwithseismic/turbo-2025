import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'

interface SettingsCardProps {
  title: string
  description?: string
  children: React.ReactNode
  isVisible: boolean
}

export const SettingsCard = ({
  title,
  description,
  children,
  isVisible,
}: SettingsCardProps) => {
  if (!isVisible) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  )
}

interface SettingItemProps {
  label: string
  description?: string
  isVisible: boolean
  children?: React.ReactNode
  action?: React.ReactNode
}

export const SettingItem = ({
  label,
  description,
  isVisible,
  children,
  action,
}: SettingItemProps) => {
  if (!isVisible) return null

  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <Label>{label}</Label>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        {children}
      </div>
      {action}
    </div>
  )
}
