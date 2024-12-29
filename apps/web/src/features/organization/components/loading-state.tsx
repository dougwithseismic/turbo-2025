'use client'

import { ChevronsUpDown } from 'lucide-react'
import { CollapsibleItem } from '@/features/application-shell/components/navigation/collapsible-item'
import { Skeleton } from '@/components/ui/skeleton'
import { motion, AnimatePresence } from 'framer-motion'

interface LoadingStateProps {
  isCollapsed?: boolean
}

export function LoadingState({ isCollapsed = false }: LoadingStateProps) {
  return (
    <CollapsibleItem isCollapsed={isCollapsed}>
      <div className="flex items-center gap-2 w-full">
        <CollapsibleItem.Trigger>
          <Skeleton className="size-6 rounded-full shrink-0" />
        </CollapsibleItem.Trigger>
        <AnimatePresence>
          {!isCollapsed && (
            <CollapsibleItem.Content className="ml-0">
              <motion.div className="flex items-center justify-between gap-2 pr-2">
                <Skeleton className="h-4 w-[100px]" />
                <ChevronsUpDown className="size-4 ml-auto shrink-0 opacity-25" />
              </motion.div>
            </CollapsibleItem.Content>
          )}
        </AnimatePresence>
      </div>
    </CollapsibleItem>
  )
}
