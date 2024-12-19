import Link from 'next/link'
import { cn } from '@/lib/utils'
import { type LucideIcon } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { motion } from 'framer-motion'

export interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  isExternal?: boolean
}

export interface NavLinkProps extends NavItem {
  isCollapsed: boolean
  pathname: string
}

export function NavLink({
  title,
  href,
  icon: Icon,
  isCollapsed,
  pathname,
}: NavLinkProps) {
  const iconComponent = (
    <motion.div className="flex h-4 w-4" whileTap={{ scale: 0.95 }}>
      <Icon className="h-4 w-4" />
    </motion.div>
  )

  const titleComponent = (
    <motion.span
      className={cn('ml-2 truncate', isCollapsed && 'hidden')}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.2 }}
    >
      {title}
    </motion.span>
  )

  const linkContent = (
    <motion.div
      className={cn(
        'relative flex items-center justify-center rounded-md text-sm font-medium hover:bg-sidebar-accent hover:text-accent-foreground transition-colors',
        isCollapsed ? 'aspect-square justify-center h-10' : 'w-full h-10',
        pathname === href
          ? 'bg-gradient-to-r from-primary to-accent text-accent-foreground'
          : 'text-muted-foreground',
      )}
      whileTap={{ scale: 0.98 }}
      layout
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 30,
      }}
    >
      <Link href={href} className="flex w-full items-center">
        <motion.div
          className="flex h-10 w-10 items-center justify-center line-clamp-1"
          layout
        >
          {iconComponent}
        </motion.div>
        {isCollapsed ? '' : titleComponent}
      </Link>
    </motion.div>
  )

  if (isCollapsed) {
    return (
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
          <TooltipContent side="right" align="center">
            {title}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return linkContent
}
