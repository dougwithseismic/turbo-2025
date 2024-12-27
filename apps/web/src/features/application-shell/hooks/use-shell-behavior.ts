'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { useShell } from '../context/shell-context'

export function useShellBehavior() {
  const pathname = usePathname()
  const { config, setSidebarExpanded, setMobileSidebarOpen } = useShell()

  // Handle navigation-based behaviors
  useEffect(() => {
    if (config.sidebar.collapseOnNavigate) {
      setSidebarExpanded(false)
    }
    if (config.sidebar.collapseOnMobileClick) {
      setMobileSidebarOpen(false)
    }
  }, [
    pathname,
    config.sidebar.collapseOnNavigate,
    config.sidebar.collapseOnMobileClick,
    setSidebarExpanded,
    setMobileSidebarOpen,
  ])

  return {
    handleSearchFocus: () => {
      if (config.sidebar.expandOnSearch) {
        setSidebarExpanded(true)
      }
    },
  }
}
