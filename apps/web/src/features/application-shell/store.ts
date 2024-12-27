import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ShellConfig, defaultShellConfig } from './config/shell.config'

/**
 * Team data structure representing a workspace or organization
 */
export interface Team {
  /** Unique identifier for the team */
  id: string
  /** Display name of the team */
  name: string
  /** Subscription plan or status */
  plan: string
  /** Optional URL to team's logo image */
  logo?: string
}

/**
 * Shell state interface defining the application shell's state and actions
 */
interface ShellState {
  // Sidebar state
  /** Whether the sidebar is in expanded state */
  isSidebarExpanded: boolean
  /** Whether the sidebar is being hovered over */
  isSidebarHovered: boolean
  /** Whether the mobile sidebar drawer is open */
  isMobileSidebarOpen: boolean
  // Team state
  /** Currently selected team */
  selectedTeam: Team | null
  /** List of available teams */
  teams: Team[]
  // Config state
  /** Shell configuration */
  config: ShellConfig
  // Actions
  /** Set the expanded state of the sidebar */
  setSidebarExpanded: (expanded: boolean) => void
  /** Set the hover state of the sidebar */
  setSidebarHovered: (hovered: boolean) => void
  /** Set the open state of the mobile sidebar */
  setMobileSidebarOpen: (open: boolean) => void
  /** Toggle the sidebar expanded state */
  toggleSidebar: () => void
  /** Set the currently selected team */
  setSelectedTeam: (team: Team) => void
  /** Update the list of available teams */
  setTeams: (teams: Team[]) => void
  /** Update shell configuration */
  setConfig: (config: Partial<ShellConfig>) => void
}

/**
 * Shell store managing the application shell's state
 * Uses persist middleware to save sidebar state across page reloads
 *
 * @example
 * ```tsx
 * const { isSidebarExpanded, toggleSidebar } = useShellStore()
 *
 * // Toggle sidebar
 * toggleSidebar()
 *
 * // Set sidebar state directly
 * setSidebarExpanded(true)
 * ```
 */
export const useShellStore = create<ShellState>()(
  persist(
    (set) => ({
      // Initial sidebar state
      isSidebarExpanded: false,
      isSidebarHovered: false,
      isMobileSidebarOpen: false,
      // Initial team state
      selectedTeam: null,
      teams: [],
      // Initial config state
      config: defaultShellConfig,
      // Actions
      setSidebarExpanded: (expanded) => set({ isSidebarExpanded: expanded }),
      setSidebarHovered: (hovered) => set({ isSidebarHovered: hovered }),
      setMobileSidebarOpen: (open) => set({ isMobileSidebarOpen: open }),
      toggleSidebar: () =>
        set((state) => ({ isSidebarExpanded: !state.isSidebarExpanded })),
      setSelectedTeam: (team) => set({ selectedTeam: team }),
      setTeams: (teams) => set({ teams }),
      setConfig: (config) =>
        set((state) => ({
          config: {
            ...state.config,
            sidebar: {
              ...state.config.sidebar,
              ...config.sidebar,
            },
          },
        })),
    }),
    {
      name: 'shell-storage',
      // Only persist sidebar expanded state
      partialize: (state) => ({
        isSidebarExpanded: state.isSidebarExpanded,
      }),
    },
  ),
)
