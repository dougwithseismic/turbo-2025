'use client'

import * as React from 'react'
import { Settings } from 'lucide-react'
import { CollapsibleItem } from '@/features/application-shell/components/navigation/collapsible-item'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { AnimatePresence } from 'framer-motion'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'

interface UserSwitcherProps {
  user: {
    email?: string
    user_metadata?: {
      avatar_url?: string
    }
  } | null
  isCollapsed?: boolean
  onSignOut: () => void
}

export function UserSwitcher({
  user,
  isCollapsed = false,
  onSignOut,
}: UserSwitcherProps) {
  if (!user?.email) return <Skeleton className="w-full h-10" />

  const username = user.email.split('@')[0]
  const avatarFallback = user.email.charAt(0).toUpperCase()

  return (
    <CollapsibleItem isCollapsed={isCollapsed} className="select-none">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center gap-2 w-full">
            <CollapsibleItem.Trigger tooltip={username}>
              <Avatar className="size-6 shrink-0">
                <AvatarFallback>{avatarFallback}</AvatarFallback>
              </Avatar>
            </CollapsibleItem.Trigger>
            <AnimatePresence initial={false}>
              <CollapsibleItem.Content className="ml-0">
                <div className="flex items-center justify-between gap-2 pr-2">
                  <div className="flex flex-col items-start">
                    <span className="font-medium truncate">{username}</span>
                    <span className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </span>
                  </div>
                  <Settings className="size-4 ml-auto shrink-0 opacity-50" />
                </div>
              </CollapsibleItem.Content>
            </AnimatePresence>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
          align="start"
          sideOffset={4}
        >
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuItem>Billing</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onSignOut}>Log out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </CollapsibleItem>
  )
}
