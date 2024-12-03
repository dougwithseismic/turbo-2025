'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion } from 'motion/react'
import {
  Children,
  isValidElement,
  type ReactNode,
  useEffect,
  useMemo,
  cloneElement,
  type ReactElement,
} from 'react'
import {
  containerVariants,
  itemVariants,
} from '../animations/content-card-animations'
import { useContentCard } from '../context/content-card-context'
import type { ContentCardItem } from '../types/content-card-types'
import { ContentCardEmptyState } from './content-card-empty-state'
import { ContentCardFooter } from './content-card-footer'
import { ContentCardBody, type ContentCardBodyProps } from './content-card-body'
import { ContentCardHeader } from './content-card-header'
import { Search } from 'lucide-react'

const contentCardVariants = cva('', {
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
      base: '[&>[data-card-content]]:py-6 [&>[data-card-header]]:py-6 [&>[data-card-footer]]:py-6',
      compact:
        '[&>[data-card-content]]:py-3 [&>[data-card-header]]:py-3 [&>[data-card-footer]]:py-3',
      loose:
        '[&>[data-card-content]]:py-8 [&>[data-card-header]]:py-8 [&>[data-card-footer]]:py-8',
    },
    variant: {
      base: 'bg-card text-card-foreground',
      ghost: 'border-none shadow-none bg-transparent',
      outline: 'bg-transparent',
    },
  },
  defaultVariants: {
    size: 'full',
    spacing: 'base',
    variant: 'base',
  },
})

export interface ContentCardProps
  extends VariantProps<typeof contentCardVariants> {
  title: string
  description?: string
  children: ReactNode
  itemFilter?: (item: ContentCardItem) => boolean
  className?: string
  // id is required for the content card search filter to work. It should be unique.
  id?: string
}

type ContentCardComponent =
  | typeof ContentCardHeader
  | typeof ContentCardFooter
  | typeof ContentCardBody

export const ContentCard = ({
  title,
  description,
  children,
  size,
  spacing,
  variant,
  className,
  id,
}: ContentCardProps) => {
  const { filteredItems, registerItem } = useContentCard()

  const hasMatchingItems = filteredItems.some(
    (item) => item.id === id || item.parentId === id,
  )

  const { header, footer, content } = useMemo(() => {
    let header: ReactNode | null = null
    let footer: ReactNode | null = null
    let content: ReactNode[] = []

    Children.forEach(children, (child, index) => {
      if (!child) return
      if (isValidElement(child)) {
        const childType = child.type as ContentCardComponent
        if (childType === ContentCardHeader) {
          header = child.props.children
        } else if (childType === ContentCardFooter) {
          footer = child.props.children
        } else if (childType === ContentCardBody) {
          content.push(
            cloneElement(child as ReactElement<ContentCardBodyProps>, {
              parentId: id,
              key: child.key ?? `content-card-body-${index}`,
            }),
          )
        } else {
          content.push(
            cloneElement(child, {
              key: child.key ?? `content-card-content-${index}`,
            }),
          )
        }
      } else {
        content.push(child)
      }
    })

    return { header, footer, content }
  }, [children, id])

  useEffect(() => {
    id && registerItem(id, { id, label: title, description, parentId: null })
  }, [id])

  const showEmptyState = !hasMatchingItems && filteredItems.length > 0

  if (!hasMatchingItems || filteredItems.length === 0) {
    return null
  }

  return (
    <Card
      className={cn(contentCardVariants({ size, spacing, variant }), className)}
    >
      <motion.div variants={containerVariants} initial="hidden" animate="show">
        <CardHeader data-card-header className="px-6 py-6">
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-between"
          >
            <div className="flex flex-col gap-2">
              <CardTitle>{title}</CardTitle>
              {description && <CardDescription>{description}</CardDescription>}
            </div>
            {header && (
              <div className="ml-4 flex-shrink-0">
                <Slot>{header}</Slot>
              </div>
            )}
          </motion.div>
        </CardHeader>
        <Separator className="w-full" />
        <CardContent data-card-content className="py-6">
          <motion.div variants={itemVariants} className="flex flex-col gap-4">
            {showEmptyState ? (
              <ContentCardEmptyState
                icon={<Search className="h-12 w-12" />}
                title="No matching results"
                description="Try adjusting your search terms to find what you're looking for."
              />
            ) : (
              content
            )}
          </motion.div>
        </CardContent>
        {footer && !showEmptyState && (
          <>
            <Separator className="w-full" />
            <CardFooter data-card-footer className="px-6 py-6">
              <motion.div variants={itemVariants} className="w-full">
                <Slot>{footer}</Slot>
              </motion.div>
            </CardFooter>
          </>
        )}
      </motion.div>
    </Card>
  )
}
