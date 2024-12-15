'use client'

import { containerVariants } from '@/components/content-card/animations/content-card-animations'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion } from 'motion/react'
import { ReactNode } from 'react'

const dashboardCardVariants = cva(
  cn(
    'hover:shadow-sm',
    'hover:shadow-primary/10',
    'transition-shadow',
    'duration-800',
    'h-full',
  ),
  {
    variants: {
      size: {
        base: '',
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        full: 'w-full',
      },
      spacing: {
        base: cn(
          '[&>[data-card-content]]:py-6',
          '[&>[data-card-header]]:py-6',
          '[&>[data-card-footer]]:py-6',
        ),
        compact: cn(
          '[&>[data-card-content]]:py-3',
          '[&>[data-card-header]]:py-3',
          '[&>[data-card-footer]]:py-3',
        ),
        loose: cn(
          '[&>[data-card-content]]:py-8',
          '[&>[data-card-header]]:py-8',
          '[&>[data-card-footer]]:py-8',
        ),
      },
      variant: {
        base: cn(
          'relative',
          'bg-gradient-to-b',
          'from-primary-foreground/[2%]',
          'to-primary/[4%]',
          'bg-blend-soft-light',
          'text-card-foreground',
          'shadow-md',
          'shadow-black/5',
        ),
        ghost: cn('border-none', 'shadow-none', 'bg-transparent'),
        outline: 'bg-transparent',
      },
    },
    defaultVariants: {
      size: 'full',
      spacing: 'base',
      variant: 'base',
    },
  },
)

export interface DashboardCardProps
  extends VariantProps<typeof dashboardCardVariants> {
  children: ReactNode
  className?: string
}

export const DashboardCard = ({
  children,
  size,
  spacing,
  variant,
  className,
}: DashboardCardProps) => {
  return (
    <Card
      className={cn(
        dashboardCardVariants({ size, spacing, variant }),
        className,
      )}
    >
      <motion.div variants={containerVariants} initial="hidden" animate="show">
        {children}
      </motion.div>
    </Card>
  )
}
