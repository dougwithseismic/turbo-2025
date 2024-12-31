import * as React from 'react'
import { cn } from '@/lib/utils'
import { motion, HTMLMotionProps } from 'framer-motion'
import { Slot } from '@radix-ui/react-slot'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface CollapsibleItemContextValue {
  isCollapsed: boolean
  isActive?: boolean
}

const CollapsibleItemContext = React.createContext<CollapsibleItemContextValue>(
  {
    isCollapsed: false,
  },
)

interface CollapsibleItemProps extends HTMLMotionProps<'button'> {
  isCollapsed: boolean
  isActive?: boolean
}

export function CollapsibleItem({
  isCollapsed,
  isActive,
  className,
  children,
  ...props
}: CollapsibleItemProps) {
  return (
    <CollapsibleItemContext.Provider value={{ isCollapsed, isActive }}>
      <motion.button
        className={cn(
          'relative text-left flex items-center justify-center rounded-md text-sm font-medium hover:bg-sidebar-accent hover:text-accent-foreground transition-colors',
          isCollapsed ? 'aspect-square h-10' : 'w-full h-10',
          isActive
            ? 'bg-gradient-to-r from-primary to-accent text-accent-foreground'
            : 'text-muted-foreground',
          className,
        )}
        whileTap={{ scale: 0.98 }}
        {...props}
      >
        {children}
      </motion.button>
    </CollapsibleItemContext.Provider>
  )
}

interface CollapsibleTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  tooltip?: string
  asChild?: boolean
}

function CollapsibleTrigger({
  tooltip,
  asChild,
  className,
  children,
  ...props
}: CollapsibleTriggerProps) {
  const { isCollapsed } = React.useContext(CollapsibleItemContext)
  const Comp = asChild ? Slot : 'div'

  if (isCollapsed && tooltip) {
    return (
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Comp
              className={cn(
                'size-10 items-center justify-center flex aspect-square',
                className,
              )}
              {...props}
            >
              {children}
            </Comp>
          </TooltipTrigger>
          <TooltipContent side="right" align="center">
            {tooltip}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <Comp
      className={cn(
        'size-10 items-center justify-center flex aspect-square',
        className,
      )}
      {...props}
    >
      {children}
    </Comp>
  )
}

CollapsibleItem.Trigger = CollapsibleTrigger

function CollapsibleContent({
  className,
  children,
  ...props
}: HTMLMotionProps<'div'>) {
  const { isCollapsed } = React.useContext(CollapsibleItemContext)

  if (isCollapsed) return null

  return (
    <motion.div
      layout
      className={cn(
        'ml-2 w-full cursor-pointer select-none truncate',
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}

CollapsibleItem.Content = CollapsibleContent
