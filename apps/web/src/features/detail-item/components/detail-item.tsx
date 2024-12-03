'use client'

import { cn } from '@/lib/utils'
import { Slot } from '@radix-ui/react-slot'
import React, { Children } from 'react'

interface DetailItemSubComponentProps {
  children: React.ReactNode
  asChild?: boolean
  className?: string
}

interface DetailItemComposition {
  ({ children, asChild, className }: DetailItemProps): JSX.Element
  Label: React.FC<DetailItemSubComponentProps>
  Content: React.FC<DetailItemSubComponentProps>
  Action: React.FC<DetailItemSubComponentProps>
}

interface DetailItemProps {
  children: React.ReactNode
  asChild?: boolean
  className?: string
}

const DetailItemLabel: React.FC<DetailItemSubComponentProps> = ({
  children,
  asChild,
  className,
}) => {
  const Comp = asChild ? Slot : 'span'
  return (
    <Comp className={cn('text-sm text-muted-foreground', className)}>
      {children}
    </Comp>
  )
}

const DetailItemContent: React.FC<DetailItemSubComponentProps> = ({
  children,
  asChild,
  className,
}) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp className={cn('flex items-center gap-2', className)}>{children}</Comp>
  )
}

const DetailItemAction: React.FC<DetailItemSubComponentProps> = ({
  children,
  asChild,
  className,
}) => {
  const Comp = asChild ? Slot : 'div'
  return <Comp className={cn(className)}>{children}</Comp>
}

const DetailItem = Object.assign(
  ({ children, asChild, className }: DetailItemProps) => {
    const Comp = asChild ? Slot : 'div'

    return (
      <Comp className={cn('flex flex-col gap-1 w-full', className)}>
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            {Children.map(children, (child) => {
              if (
                React.isValidElement(child) &&
                child.type === DetailItemLabel
              ) {
                return child
              }
              return null
            })}
          </div>
          <div className="flex items-center justify-between gap-2">
            {Children.map(children, (child) => {
              if (
                React.isValidElement(child) &&
                child.type === DetailItemContent
              ) {
                return child
              }
              return null
            })}
            {Children.map(children, (child) => {
              if (
                React.isValidElement(child) &&
                child.type === DetailItemAction
              ) {
                return child
              }
              return null
            })}
          </div>
        </div>
      </Comp>
    )
  },
  {
    Label: DetailItemLabel,
    Content: DetailItemContent,
    Action: DetailItemAction,
  },
) as DetailItemComposition

export { DetailItem }
