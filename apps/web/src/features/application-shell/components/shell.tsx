'use client'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'
import * as React from 'react'
import { useEffect } from 'react'
import { useShell } from '../context/shell-context'
import { useShellBehavior } from '../hooks/use-shell-behavior'
import { ShellNav } from './shell-nav'
import { cn } from '@/lib/utils'

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
    config,
  } = useShell()
  useShellBehavior()

  useEffect(() => {
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
      {/* Desktop Sidebar */}
      <div className="hidden md:block fixed left-0 top-0 bottom-0 h-screen z-50">
        <div
          className="bg-background h-screen transition-[width] duration-100 ease-in-out will-change-[width,transform]"
          style={{
            width: isSidebarExpanded
              ? config.sidebar.width
              : config.sidebar.collapsedWidth,
          }}
          onMouseEnter={() =>
            config.sidebar.enableHoverExpand && setSidebarHovered(true)
          }
          onMouseLeave={() =>
            config.sidebar.enableHoverExpand && setSidebarHovered(false)
          }
        >
          <ShellNav />
        </div>
      </div>

      {/* Mobile Sidebar */}
      {config.sidebar.enableMobileDrawer && (
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="fixed left-4 top-3 z-50"
            onClick={() => setMobileSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation</span>
          </Button>

          <Sheet open={isMobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
            <SheetContent side="left" className="w-[280px] p-0">
              <ShellNav isForcedExpanded />
            </SheetContent>
          </Sheet>
        </div>
      )}

      {/* Main Content */}
      <div
        className={cn(
          'flex-1 transition-[padding] duration-100 ease-in-out will-change-[padding]',
          config.sidebar.enableLeftPadding && [
            'pl-0 md:pl-[56px]',
            isSidebarExpanded && 'md:pl-[280px]',
          ],
        )}
      >
        <div className="container mx-auto px-4 md:px-6">{children}</div>
      </div>
    </div>
  )
}
