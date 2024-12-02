import { cva, type VariantProps } from 'class-variance-authority'
import { type ReactNode, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { motion } from 'motion/react'
import { itemVariants } from '../animations/content-card-animations'
import { useContentCard } from '../context/content-card-context'

const contentCardItemVariants = cva('flex items-center', {
  variants: {
    layout: {
      default: 'justify-between',
      stacked: 'flex-col items-start',
      centered: 'justify-center',
      reversed: 'flex-row-reverse justify-between',
    },
    spacing: {
      default: 'gap-4',
      tight: 'gap-2',
      loose: 'gap-6',
      none: 'gap-0',
    },
    size: {
      default: '',
      sm: '[&>div]:space-y-0.5 [&>div>div]:text-sm',
      lg: '[&>div]:space-y-1.5 [&>div>div]:text-lg',
    },
    contentWidth: {
      default: '',
      full: '[&>div:first-child]:w-full',
      auto: '[&>div:first-child]:w-auto',
    },
  },
  defaultVariants: {
    layout: 'default',
    spacing: 'default',
    size: 'default',
    contentWidth: 'default',
  },
})

export interface ContentCardItemProps
  extends VariantProps<typeof contentCardItemVariants> {
  id?: string
  label?: string
  description?: string
  action?: ReactNode
  children?: ReactNode
  className?: string
  contentClassName?: string
  parentId?: string
}

export const ContentCardItem = ({
  id,
  label = '',
  description = '',
  action,
  children,
  className,
  contentClassName,
  layout,
  spacing,
  size,
  contentWidth,
  parentId,
}: ContentCardItemProps) => {
  const { filteredItems, registerItem } = useContentCard()

  const doesMatchItems = filteredItems.some((item) => item.id === id)

  useEffect(() => {
    if (id) {
      registerItem(id, { id, label, description, parentId })
    }
  }, [id])

  if (!doesMatchItems) {
    return null
  }

  return (
    <motion.div
      variants={itemVariants}
      className={cn(
        contentCardItemVariants({
          layout,
          spacing,
          size,
          contentWidth,
        }),
        className,
      )}
    >
      <div className={cn('space-y-1', contentClassName)}>
        <div className="font-medium">{label}</div>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        {children}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </motion.div>
  )
}
