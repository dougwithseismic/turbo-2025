import { CollapsibleItem } from '@/features/application-shell/components/navigation/collapsible-item'
import { Skeleton } from '@/components/ui/skeleton'

interface LoadingStateProps {
  isCollapsed?: boolean
}

export function LoadingState({ isCollapsed = false }: LoadingStateProps) {
  return (
    <CollapsibleItem isCollapsed={isCollapsed}>
      <div className="flex items-center gap-2 w-full">
        <CollapsibleItem.Trigger>
          <Skeleton className="size-6 rounded-md" />
        </CollapsibleItem.Trigger>
        {!isCollapsed && (
          <CollapsibleItem.Content className="ml-0">
            <Skeleton className="h-4 w-24" />
          </CollapsibleItem.Content>
        )}
      </div>
    </CollapsibleItem>
  )
}
