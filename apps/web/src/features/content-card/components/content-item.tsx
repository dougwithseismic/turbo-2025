import { cva, type VariantProps } from 'class-variance-authority'
import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

const contentItemVariants = cva('flex items-center', {
  variants: {
    layout: {
      default: 'justify-between',
      stacked: 'flex-col items-start gap-4',
      centered: 'justify-center',
    },
    spacing: {
      default: 'gap-4',
      tight: 'gap-2',
      loose: 'gap-6',
    },
  },
  defaultVariants: {
    layout: 'default',
    spacing: 'default',
  },
})

export interface ContentItemProps
  extends VariantProps<typeof contentItemVariants> {
  label: string
  description?: string
  action?: ReactNode
  children?: ReactNode
  className?: string
  contentClassName?: string
}

export const ContentItem = ({
  label,
  description,
  action,
  children,
  className,
  contentClassName,
  layout,
  spacing,
}: ContentItemProps) => {
  return (
    <div className={cn(contentItemVariants({ layout, spacing }), className)}>
      <div className={cn('space-y-1', contentClassName)}>
        <div className="font-medium">{label}</div>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        {children}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}
