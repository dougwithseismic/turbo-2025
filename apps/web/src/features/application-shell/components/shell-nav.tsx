'use client'

import { GoogleIcon } from '@/components/icons/social-icons'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { ChevronFirst, Settings } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useShellStore } from '../store'
import {
  identityNav,
  leadsNav,
  mainNav,
  NavSection,
  projectsNav,
} from './navigation'

export function ShellNav() {
  const pathname = usePathname()
  const { user } = useAuth()
  const { isSidebarExpanded, isSidebarHovered, toggleSidebar } = useShellStore()

  console.log(isSidebarExpanded, isSidebarHovered)

  return (
    <div className="flex h-full w-full flex-col bg-background border-r border-border">
      <div className="border-b min-h-14">
        <Button
          variant="ghost"
          className={cn(
            'flex h-full w-full',
            isSidebarExpanded
              ? 'items-center justify-between'
              : 'items-center justify-center',
          )}
          onClick={toggleSidebar}
        >
          {(isSidebarExpanded || (!isSidebarExpanded && !isSidebarHovered)) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <GoogleIcon className="h-4 w-4" />
            </motion.div>
          )}

          {(isSidebarExpanded || isSidebarHovered) && (
            <motion.div
              initial={{ opacity: 0, rotate: 180 }}
              animate={{ opacity: 1, rotate: isSidebarExpanded ? 0 : 180 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronFirst className="h-4 w-4" />
            </motion.div>
          )}
        </Button>
      </div>

      <div className="flex-1 flex flex-col items-center overflow-hidden">
        {/* <div className="py-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-10 w-full justify-start gap-2 hover:bg-accent"
              >
                <div className="flex w-6 items-center justify-center">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={selectedTeam?.logo} />
                    <AvatarFallback>
                      {selectedTeam?.name?.charAt(0) || 'T'}
                    </AvatarFallback>
                  </Avatar>
                </div>
                {isSidebarExpanded && (
                  <>
                    <div className="flex flex-1 flex-col items-start text-sm">
                      <span className="truncate font-medium">
                        {selectedTeam?.name || 'Select Team'}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {selectedTeam?.plan}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[240px]">
              {teams.map((team) => (
                <DropdownMenuItem
                  key={team.id}
                  onClick={() => setSelectedTeam(team)}
                  className="flex items-center gap-2"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={team.logo} />
                    <AvatarFallback>{team.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-1 flex-col">
                    <span className="truncate">{team.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {team.plan}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Button variant="ghost" className="w-full justify-start">
                  Create Team
                </Button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div> */}

        <NavSection
          items={mainNav}
          isCollapsed={!isSidebarExpanded}
          pathname={pathname}
        />
        <NavSection
          title="Identity"
          items={identityNav}
          isCollapsed={!isSidebarExpanded}
          pathname={pathname}
        />
        <NavSection
          title="Leads"
          items={leadsNav}
          isCollapsed={!isSidebarExpanded}
          pathname={pathname}
        />
        <NavSection
          title="Projects & Payments"
          items={projectsNav}
          isCollapsed={!isSidebarExpanded}
          pathname={pathname}
        />
      </div>

      <div className="border-b min-h-fit p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-center items-center gap-4 py-2 px-0',
              )}
            >
              <div className="flex items-center justify-center">
                <Avatar className="size-7">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback>
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>
              {!!isSidebarExpanded && (
                <>
                  <div className="flex flex-1 flex-col items-start text-sm">
                    <span className="truncate font-medium">
                      {user?.email?.split('@')[0] || 'User'}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user?.email}
                    </span>
                  </div>
                  <Settings className="h-4 w-4 opacity-50" />
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[240px]">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
