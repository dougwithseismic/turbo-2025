import { create } from 'zustand'

interface ShellData {
  id?: string
  name?: string
  [key: string]: unknown
}

interface ApplicationShellState {
  data: ShellData | null
  isLoading: boolean
  error: Error | null
  isSidebarExpanded: boolean
  isSidebarHovered: boolean
  isMobileSidebarOpen: boolean
  config: {
    enabled: boolean
    sidebar: {
      width: number
      collapsedWidth: number
      enableHoverExpand: boolean
      enableMobileDrawer: boolean
      enableLeftPadding: boolean
      collapseOnNavigate: boolean
      collapseOnMobileClick: boolean
      expandOnSearch: boolean
    }
    settings: {
      timeout: number
      maxRetries: number
    }
  }
  setData: (data: ShellData) => void
  setLoading: (loading: boolean) => void
  setError: (error: Error | null) => void
  setSidebarHovered: (hovered: boolean) => void
  setMobileSidebarOpen: (open: boolean) => void
  setSidebarExpanded: (expanded: boolean) => void
  toggleSidebar: () => void
  updateConfig: (config: Partial<ApplicationShellState['config']>) => void
  reset: () => void
}

const initialState = {
  data: null,
  isLoading: false,
  error: null,
  isSidebarExpanded: true,
  isSidebarHovered: false,
  isMobileSidebarOpen: false,
  config: {
    enabled: true,
    sidebar: {
      width: 280,
      collapsedWidth: 56,
      enableHoverExpand: true,
      enableMobileDrawer: true,
      enableLeftPadding: true,
      collapseOnNavigate: true,
      collapseOnMobileClick: true,
      expandOnSearch: true,
    },
    settings: {
      timeout: 5000,
      maxRetries: 3,
    },
  },
}

export const useApplicationShellStore = create<ApplicationShellState>()(
  (set) => ({
    ...initialState,
    setData: (data) => set({ data }),
    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),
    setSidebarHovered: (hovered) => set({ isSidebarHovered: hovered }),
    setMobileSidebarOpen: (open) => set({ isMobileSidebarOpen: open }),
    setSidebarExpanded: (expanded) => set({ isSidebarExpanded: expanded }),
    toggleSidebar: () =>
      set((state) => ({ isSidebarExpanded: !state.isSidebarExpanded })),
    updateConfig: (newConfig) =>
      set((state) => ({
        config: {
          ...state.config,
          ...newConfig,
          settings: {
            ...state.config.settings,
            ...newConfig.settings,
          },
          sidebar: {
            ...state.config.sidebar,
            ...newConfig.sidebar,
          },
        },
      })),
    reset: () => set(initialState),
  }),
)
