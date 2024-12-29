'use client'

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
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useGetUserMemberships } from '@repo/supabase'
import { supabaseClient } from '@/lib/supabase/client'
import { useAuth } from '@/features/auth/hooks/use-auth'

interface OrganizationSwitcherProps {
  teams: {
    name: string
    logo: React.ElementType
    plan: string
  }[]
  isCollapsed?: boolean
}

export function OrganizationSwitcher({
  teams,
  isCollapsed = false,
}: OrganizationSwitcherProps) {
  const [activeTeam, setActiveTeam] = React.useState(teams[0])

  const { user } = useAuth()

  const { data: memberships = [] } = useGetUserMemberships({
    supabase: supabaseClient,
    userId: String(user?.id),
    resourceType: 'organization',
    enabled: !!user?.id,
  })

  console.log(memberships)

  if (!activeTeam) return null

  return (
    <CollapsibleItem isCollapsed={isCollapsed}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center gap-2 w-full">
            <CollapsibleItem.Trigger tooltip={activeTeam.name}>
              <Avatar className="size-6 shrink-0">
                <AvatarFallback>{activeTeam.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </CollapsibleItem.Trigger>
            <AnimatePresence>
              {!isCollapsed && (
                <CollapsibleItem.Content className="ml-0">
                  <motion.div className="flex items-center justify-between gap-2 pr-2">
                    <span className="font-medium truncate">
                      {activeTeam.name}
                    </span>
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
            Teams
          </DropdownMenuLabel>
          {teams.map((team, index) => (
            <DropdownMenuItem
              key={team.name}
              onClick={() => setActiveTeam(team)}
              className="gap-2 p-2"
            >
              <div className="flex size-6 items-center justify-center rounded-sm border">
                <team.logo className="size-4 shrink-0" />
              </div>
              {team.name}
              <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem className="gap-2 p-2">
            <div className="flex size-6 items-center justify-center rounded-md border bg-background">
              <Plus className="size-4" />
            </div>
            <div className="font-medium text-muted-foreground">Add team</div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </CollapsibleItem>
  )
}
