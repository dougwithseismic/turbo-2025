'use client'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'
import * as React from 'react'
import { useShellStore } from '../store'
import { ShellNav } from './shell-nav'

export const SIDEBAR_WIDTH = 280
export const COLLAPSED_WIDTH = 56

interface ShellProps {
  children: React.ReactNode
}

export function Shell({ children }: ShellProps) {
  const {
    isSidebarExpanded,
    isMobileSidebarOpen,
    setSidebarHovered,
    setMobileSidebarOpen,
    setTeams,
  } = useShellStore()

  React.useEffect(() => {
    setTeams([
      {
        id: '1',
        name: 'Independent workspace',
        plan: 'Doug Silkstone',
        logo: '/team-logos/acme.png',
      },
      {
        id: '2',
        name: 'Startup Co',
        plan: 'Pro',
        logo: '/team-logos/startup.png',
      },
      {
        id: '3',
        name: 'Personal',
        plan: 'Free',
        logo: '/team-logos/personal.png',
      },
    ])
  }, [setTeams])

  return (
    <div className="flex h-screen">
      <div className="fixed left-0 top-0 bottom-0 flex md:block h-screen z-50">
        <div
          className="hidden bg-background h-screen md:block transition-[width] duration-100 ease-in-out will-change-[width,transform]"
          style={{ width: isSidebarExpanded ? SIDEBAR_WIDTH : COLLAPSED_WIDTH }}
          onMouseEnter={() => setSidebarHovered(true)}
          onMouseLeave={() => setSidebarHovered(false)}
        >
          <ShellNav />
        </div>

        <Sheet open={isMobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
          <SheetTrigger
            asChild
            className="absolute left-4 top-3 z-50 md:hidden"
          >
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0">
            <ShellNav />
          </SheetContent>
        </Sheet>
      </div>

      <div
        style={{
          paddingLeft: SIDEBAR_WIDTH,
        }}
        className="flex-1 transition-[padding] duration-100 ease-in-out will-change-[padding]"
      >
        {children}
      </div>
    </div>
  )
}
