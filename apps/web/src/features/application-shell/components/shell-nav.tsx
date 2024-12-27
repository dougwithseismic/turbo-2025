'use client'

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
import { Settings } from 'lucide-react'
import { usePathname } from 'next/navigation'
import {
  identityNav,
  leadsNav,
  mainNav,
  NavSection,
  projectsNav,
} from './navigation'
import { DesktopHeader } from './shell-nav/desktop-header'
import { MobileHeader } from './shell-nav/mobile-header'
import { useShellStore } from '../store'

interface ShellNavProps {
  isForcedExpanded?: boolean
}

export function ShellNav({ isForcedExpanded }: ShellNavProps = {}) {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const { isSidebarExpanded, isSidebarHovered, toggleSidebar } = useShellStore()

  // Use forced expanded state for mobile or regular state for desktop
  const isExpanded = isForcedExpanded || isSidebarExpanded
  const showHoverEffects = !isForcedExpanded && isSidebarHovered

  return (
    <div className="flex h-full w-full flex-col bg-background border-r border-border">
      {isForcedExpanded ? (
        <MobileHeader />
      ) : (
        <DesktopHeader
          isExpanded={isExpanded}
          showHoverEffects={showHoverEffects}
          onToggle={toggleSidebar}
        />
      )}

      <div className="flex-1 flex flex-col items-center overflow-hidden">
        <NavSection
          items={mainNav}
          isCollapsed={!isExpanded}
          pathname={pathname}
        />
        <NavSection
          title="Identity"
          items={identityNav}
          isCollapsed={!isExpanded}
          pathname={pathname}
        />
        <NavSection
          title="Leads"
          items={leadsNav}
          isCollapsed={!isExpanded}
          pathname={pathname}
        />
        <NavSection
          title="Projects & Payments"
          items={projectsNav}
          isCollapsed={!isExpanded}
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
              {!!isExpanded && (
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
            <DropdownMenuItem onClick={() => signOut()}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
