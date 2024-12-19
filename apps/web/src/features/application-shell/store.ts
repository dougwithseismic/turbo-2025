import { create } from 'zustand'

export interface Team {
  id: string
  name: string
  plan: string
  logo?: string
}

interface ShellState {
  // Sidebar state
  isSidebarExpanded: boolean
  isSidebarHovered: boolean
  isMobileSidebarOpen: boolean
  // Team state
  selectedTeam: Team | null
  teams: Team[]
  // Actions
  setSidebarExpanded: (expanded: boolean) => void
  setSidebarHovered: (hovered: boolean) => void
  setMobileSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setSelectedTeam: (team: Team) => void
  setTeams: (teams: Team[]) => void
}

export const useShellStore = create<ShellState>((set) => ({
  // Initial sidebar state
  isSidebarExpanded: false,
  isSidebarHovered: false,
  isMobileSidebarOpen: false,
  // Initial team state
  selectedTeam: null,
  teams: [],
  // Actions
  setSidebarExpanded: (expanded) => set({ isSidebarExpanded: expanded }),
  setSidebarHovered: (hovered) => set({ isSidebarHovered: hovered }),
  setMobileSidebarOpen: (open) => set({ isMobileSidebarOpen: open }),
  toggleSidebar: () =>
    set((state) => ({ isSidebarExpanded: !state.isSidebarExpanded })),
  setSelectedTeam: (team) => set({ selectedTeam: team }),
  setTeams: (teams) => set({ teams }),
}))
