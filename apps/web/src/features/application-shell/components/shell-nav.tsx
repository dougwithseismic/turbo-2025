'use client'

import { useAuth } from '@/features/auth/hooks/use-auth'
import { OrganizationSwitcher } from '@/features/organization/components/organization-switcher'
import { UserSwitcher } from '@/features/auth/components/user-switcher'
import { GlobeIcon } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useShellStore } from '../store'
import {
  identityNav,
  leadsNav,
  mainNav,
  NavSection,
  projectsNav,
} from './navigation'
import { DesktopHeader } from './shell-nav/desktop-header'
import { MobileHeader } from './shell-nav/mobile-header'

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

      <div className="flex-1 py-3 flex flex-col items-center overflow-hidden">
        <div className="w-full flex px-2">
          <OrganizationSwitcher
            isCollapsed={!isExpanded}
            teams={[
              {
                name: 'Acme',
                logo: GlobeIcon,
                plan: 'Pro',
              },
            ]}
          />
        </div>
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

      <div className="border-t min-h-fit p-2">
        <UserSwitcher
          user={user}
          isCollapsed={!isExpanded}
          onSignOut={signOut}
        />
      </div>
    </div>
  )
}
