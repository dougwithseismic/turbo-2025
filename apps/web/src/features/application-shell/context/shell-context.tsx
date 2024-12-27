'use client'

import * as React from 'react'
import { useShellStore } from '../store'
import { ShellConfig, defaultShellConfig } from '../config/shell.config'
import type { Team } from '../store'

interface ShellContextValue {
  // Sidebar state
  isSidebarExpanded: boolean
  isSidebarHovered: boolean
  isMobileSidebarOpen: boolean
  // Team state
  selectedTeam: Team | null
  teams: Team[]
  // Actions
  toggleSidebar: () => void
  setSidebarExpanded: (expanded: boolean) => void
  setSidebarHovered: (hovered: boolean) => void
  setMobileSidebarOpen: (open: boolean) => void
  setSelectedTeam: (team: Team) => void
  setTeams: (teams: Team[]) => void
  // Config
  config: ShellConfig
}

const ShellContext = React.createContext<ShellContextValue | undefined>(
  undefined,
)

interface ShellProviderProps {
  children: React.ReactNode
  config?: Partial<ShellConfig>
}

export function ShellProvider({ children, config = {} }: ShellProviderProps) {
  const store = useShellStore()
  const isInitialized = React.useRef(false)

  // Merge default config with provided config
  const mergedConfig = React.useMemo(
    () => ({
      ...defaultShellConfig,
      sidebar: {
        ...defaultShellConfig.sidebar,
        ...config.sidebar,
      },
    }),
    [config],
  )

  // Load initial state from localStorage only once
  React.useEffect(() => {
    if (!mergedConfig.sidebar.persistState || isInitialized.current) return
    isInitialized.current = true

    try {
      const savedState = localStorage.getItem(mergedConfig.sidebar.storageKey!)
      if (savedState !== null) {
        store.setSidebarExpanded(JSON.parse(savedState))
      }
    } catch (error) {
      console.error('Failed to load sidebar state:', error)
    }
  }, [
    store.setSidebarExpanded,
    mergedConfig.sidebar.persistState,
    mergedConfig.sidebar.storageKey,
  ])

  // Save state changes to localStorage
  const handleStateChange = React.useCallback(
    (expanded: boolean) => {
      if (!mergedConfig.sidebar.persistState) return
      try {
        localStorage.setItem(
          mergedConfig.sidebar.storageKey!,
          JSON.stringify(expanded),
        )
      } catch (error) {
        console.error('Failed to save sidebar state:', error)
      }
    },
    [mergedConfig.sidebar.persistState, mergedConfig.sidebar.storageKey],
  )

  React.useEffect(() => {
    handleStateChange(store.isSidebarExpanded)
  }, [store.isSidebarExpanded, handleStateChange])

  const value = React.useMemo(
    () => ({
      // Sidebar state
      isSidebarExpanded: store.isSidebarExpanded,
      isSidebarHovered: store.isSidebarHovered,
      isMobileSidebarOpen: store.isMobileSidebarOpen,
      // Team state
      selectedTeam: store.selectedTeam,
      teams: store.teams,
      // Actions
      toggleSidebar: store.toggleSidebar,
      setSidebarExpanded: store.setSidebarExpanded,
      setSidebarHovered: store.setSidebarHovered,
      setMobileSidebarOpen: store.setMobileSidebarOpen,
      setSelectedTeam: store.setSelectedTeam,
      setTeams: store.setTeams,
      // Config
      config: mergedConfig,
    }),
    [
      store.isSidebarExpanded,
      store.isSidebarHovered,
      store.isMobileSidebarOpen,
      store.selectedTeam,
      store.teams,
      store.toggleSidebar,
      store.setSidebarExpanded,
      store.setSidebarHovered,
      store.setMobileSidebarOpen,
      store.setSelectedTeam,
      store.setTeams,
      mergedConfig,
    ],
  )

  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>
}

export function useShell() {
  const context = React.useContext(ShellContext)
  if (context === undefined) {
    throw new Error('useShell must be used within a ShellProvider')
  }
  return context
}
