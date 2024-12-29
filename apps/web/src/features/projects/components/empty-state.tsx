import { Plus } from 'lucide-react'
import { CollapsibleItem } from '@/features/application-shell/components/navigation/collapsible-item'
import { AnimatePresence } from 'framer-motion'

interface EmptyStateProps {
  isCollapsed?: boolean
}

export function EmptyState({ isCollapsed = false }: EmptyStateProps) {
  return (
    <CollapsibleItem isCollapsed={isCollapsed} className="select-none">
      <div className="flex items-center gap-2 w-full">
        <CollapsibleItem.Trigger tooltip="Create Project">
          <div className="flex size-6 items-center justify-center rounded-md border bg-background">
            <Plus className="size-4" />
          </div>
        </CollapsibleItem.Trigger>
        <AnimatePresence initial={false}>
          <CollapsibleItem.Content className="ml-0">
            Create Project
          </CollapsibleItem.Content>
        </AnimatePresence>
      </div>
    </CollapsibleItem>
  )
}
