import * as React from 'react'
import { ChevronsUpDown, Plus } from 'lucide-react'
import { CollapsibleItem } from '@/features/application-shell/components/navigation/collapsible-item'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'

export interface EntityItem {
  id: string
  name: string
  role?: string
  isOwner?: boolean
  avatarUrl?: string
}

interface EntitySwitcherProps<T extends EntityItem> {
  isCollapsed?: boolean
  items: T[]
  activeItem?: T
  isLoading?: boolean
  label: string
  onItemSelect: (item: T) => void
  onCreateNew: () => void
  createNewLabel: string
  EmptyState?: React.ComponentType<{ isCollapsed: boolean }>
  LoadingState?: React.ComponentType<{ isCollapsed: boolean }>
  getDisplayValue?: (item: T) => string
  getAvatarFallback?: (item: T) => string
  renderItemContent?: (item: T) => React.ReactNode
  renderItemMeta?: (item: T) => React.ReactNode
}

function DefaultLoadingState({ isCollapsed = false }) {
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

function DefaultEmptyState({
  isCollapsed = false,
  createNewLabel,
}: {
  isCollapsed: boolean
  createNewLabel: string
}) {
  return (
    <CollapsibleItem isCollapsed={isCollapsed} className="select-none">
      <div className="flex items-center gap-2 w-full">
        <CollapsibleItem.Trigger tooltip={createNewLabel}>
          <div className="flex size-6 items-center justify-center rounded-md border bg-background">
            <Plus className="size-4" />
          </div>
        </CollapsibleItem.Trigger>
        <AnimatePresence initial={false}>
          <CollapsibleItem.Content className="ml-0">
            {createNewLabel}
          </CollapsibleItem.Content>
        </AnimatePresence>
      </div>
    </CollapsibleItem>
  )
}

export function EntitySwitcher<T extends EntityItem>({
  isCollapsed = false,
  items = [],
  activeItem,
  isLoading,
  label,
  onItemSelect,
  onCreateNew,
  createNewLabel,
  EmptyState,
  LoadingState = DefaultLoadingState,
  getDisplayValue = (item) => item.name,
  getAvatarFallback = (item) => item.name.charAt(0),
  renderItemContent,
  renderItemMeta,
}: EntitySwitcherProps<T>) {
  if (isLoading) {
    const LoadingComponent = LoadingState
    return <LoadingComponent isCollapsed={isCollapsed} />
  }

  if (items.length === 0) {
    if (EmptyState) {
      return <EmptyState isCollapsed={isCollapsed} />
    }
    return (
      <DefaultEmptyState
        isCollapsed={isCollapsed}
        createNewLabel={createNewLabel}
      />
    )
  }

  if (!activeItem) return null

  const displayValue = getDisplayValue(activeItem)

  return (
    <CollapsibleItem isCollapsed={isCollapsed}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center gap-2 w-full">
            <CollapsibleItem.Trigger tooltip={displayValue}>
              <Avatar className="size-6 shrink-0">
                {activeItem.avatarUrl ? (
                  <img src={activeItem.avatarUrl} alt={displayValue} />
                ) : (
                  <AvatarFallback>
                    {getAvatarFallback(activeItem)}
                  </AvatarFallback>
                )}
              </Avatar>
            </CollapsibleItem.Trigger>
            <AnimatePresence>
              {!isCollapsed && (
                <CollapsibleItem.Content className="ml-0">
                  <motion.div className="flex items-center justify-between gap-2 pr-2">
                    <span className="font-medium truncate">{displayValue}</span>
                    <ChevronsUpDown className="size-4 ml-auto shrink-0 opacity-50" />
                  </motion.div>
                </CollapsibleItem.Content>
              )}
            </AnimatePresence>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
          align="start"
          sideOffset={4}
        >
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            {label}
          </DropdownMenuLabel>
          {items.map((item) => (
            <DropdownMenuItem
              key={item.id}
              onClick={() => onItemSelect(item)}
              className="gap-2 p-2"
            >
              <Avatar className="size-6 shrink-0">
                {item.avatarUrl ? (
                  <img src={item.avatarUrl} alt={getDisplayValue(item)} />
                ) : (
                  <AvatarFallback>{getAvatarFallback(item)}</AvatarFallback>
                )}
              </Avatar>
              <div className="flex flex-col flex-1 text-sm">
                {renderItemContent ? (
                  renderItemContent(item)
                ) : (
                  <span>{getDisplayValue(item)}</span>
                )}
                {renderItemMeta
                  ? renderItemMeta(item)
                  : item.role && (
                      <span className="text-xs text-muted-foreground">
                        {item.isOwner ? 'Owner' : item.role}
                      </span>
                    )}
              </div>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onCreateNew} className="gap-2 p-2">
            <div className="flex size-6 items-center justify-center rounded-md border bg-background">
              <Plus className="size-4" />
            </div>
            <div className="font-medium text-muted-foreground">
              {createNewLabel}
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </CollapsibleItem>
  )
}
