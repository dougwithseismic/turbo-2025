'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { useApplicationShellStore } from '../store'
import { ShellNav } from './shell-nav'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Menu, PanelRightOpen } from 'lucide-react'
import { applicationShellTransition } from '../animations'
import { motion, AnimatePresence } from 'framer-motion'

const ApplicationShellContext = React.createContext<{
  isRightPanelVisible?: boolean
  setRightPanelVisible?: (visible: boolean) => void
  isMobileRightPanelOpen?: boolean
  setMobileRightPanelOpen?: (open: boolean) => void
}>({})

export function useApplicationShell() {
  const context = React.useContext(ApplicationShellContext)
  if (!context) {
    throw new Error('useApplicationShell must be used within ApplicationShell')
  }
  return context
}

interface ApplicationShellMainProps {
  children: React.ReactNode
}

export function ApplicationShellMain({ children }: ApplicationShellMainProps) {
  const { isSidebarExpanded, config } = useApplicationShellStore()
  const { isRightPanelVisible } = useApplicationShell()

  return (
    <div
      className={cn(
        'flex-1 will-change-[padding]',
        config.sidebar.enableLeftPadding && [
          'pl-0 md:pl-[56px]',
          isSidebarExpanded && 'md:pl-[280px]',
        ],
        isRightPanelVisible && 'lg:pr-[320px]',
      )}
      style={{
        transition: `padding ${applicationShellTransition.duration}s ${applicationShellTransition.ease}`,
      }}
    >
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-auto">
          <div>{children}</div>
        </div>
      </div>
    </div>
  )
}

interface ApplicationShellNavigationProps {
  children?: React.ReactNode
}

export function ApplicationShellNavigation({
  children,
}: ApplicationShellNavigationProps) {
  const {
    isSidebarExpanded,
    isMobileSidebarOpen,
    setSidebarHovered,
    setMobileSidebarOpen,
    config,
  } = useApplicationShellStore()

  return (
    <>
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
          {children || <ShellNav />}
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
              {children || <ShellNav isForcedExpanded />}
            </SheetContent>
          </Sheet>
        </div>
      )}
    </>
  )
}

interface ApplicationShellRightPanelProps {
  children: React.ReactNode
  width?: number
  title?: string
}

export function ApplicationShellRightPanel({
  children,
  width = 320,
  title,
}: ApplicationShellRightPanelProps) {
  const {
    isRightPanelVisible,
    setRightPanelVisible,
    isMobileRightPanelOpen,
    setMobileRightPanelOpen,
  } = useApplicationShell()

  // Toggle button for desktop
  const ToggleButton = () => (
    <div className="fixed right-0 top-[20vh] z-50 hidden lg:block">
      <motion.div
        initial={false}
        animate={{
          x: isRightPanelVisible ? -width : -16, // 40px is button width
        }}
        transition={{
          duration: applicationShellTransition.duration,
          ease: applicationShellTransition.ease,
        }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (window.innerWidth >= 1024) {
              setRightPanelVisible?.(!isRightPanelVisible)
            } else {
              setMobileRightPanelOpen?.(!isMobileRightPanelOpen)
            }
          }}
        >
          <motion.div
            initial={false}
            animate={{
              rotate: isRightPanelVisible ? 180 : 0,
            }}
            transition={{
              duration: applicationShellTransition.duration,
              ease: applicationShellTransition.ease,
            }}
          >
            <PanelRightOpen className="h-5 w-5" />
          </motion.div>
          <span className="sr-only">Toggle right panel</span>
        </Button>
      </motion.div>
    </div>
  )

  // Desktop panel
  const DesktopPanel = () => (
    <AnimatePresence>
      {isRightPanelVisible && (
        <motion.div
          initial={{ x: width }}
          animate={{ x: 0 }}
          exit={{ x: width }}
          transition={{
            duration: applicationShellTransition.duration,
            ease: applicationShellTransition.ease,
          }}
          className="hidden lg:block fixed right-0 top-0 bottom-0 h-screen border-l border-border bg-background shadow-lg"
          style={{ width }}
        >
          <div className="flex flex-col h-full">
            {title && (
              <div className="h-14 flex items-center px-4 border-b border-border">
                <h2 className="font-semibold">{title}</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto"
                  onClick={() => setRightPanelVisible?.(false)}
                >
                  <motion.div
                    initial={false}
                    animate={{
                      rotate: 180,
                    }}
                    transition={{
                      duration: applicationShellTransition.duration,
                      ease: applicationShellTransition.ease,
                    }}
                  >
                    <PanelRightOpen className="h-4 w-4" />
                  </motion.div>
                </Button>
              </div>
            )}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: applicationShellTransition.duration * 0.5 }}
              className="flex-1 overflow-auto"
            >
              {children}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  // Mobile drawer
  const MobileDrawer = () => (
    <Sheet open={isMobileRightPanelOpen} onOpenChange={setMobileRightPanelOpen}>
      <SheetContent side="right" className="w-[320px] p-0">
        <div className="flex flex-col h-full">
          {title && (
            <div className="h-14 flex items-center px-4 border-b border-border">
              <h2 className="font-semibold">{title}</h2>
            </div>
          )}
          <div className="flex-1 overflow-auto">{children}</div>
        </div>
      </SheetContent>
    </Sheet>
  )

  return (
    <>
      <ToggleButton />
      <DesktopPanel />
      <MobileDrawer />
    </>
  )
}

interface ApplicationShellProps {
  children: React.ReactNode
}

export function ApplicationShell({ children }: ApplicationShellProps) {
  const [isRightPanelVisible, setRightPanelVisible] = React.useState(false)
  const [isMobileRightPanelOpen, setMobileRightPanelOpen] =
    React.useState(false)

  return (
    <ApplicationShellContext.Provider
      value={{
        isRightPanelVisible,
        setRightPanelVisible,
        isMobileRightPanelOpen,
        setMobileRightPanelOpen,
      }}
    >
      <div className="flex h-screen">{children}</div>
    </ApplicationShellContext.Provider>
  )
}
