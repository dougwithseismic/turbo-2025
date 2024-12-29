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
  config: {
    enabled: boolean
    settings: {
      timeout: number
      maxRetries: number
    }
  }
  setData: (data: ShellData) => void
  setLoading: (loading: boolean) => void
  setError: (error: Error | null) => void
  updateConfig: (config: Partial<ApplicationShellState['config']>) => void
  reset: () => void
}

const initialState = {
  data: null,
  isLoading: false,
  error: null,
  config: {
    enabled: true,
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
    updateConfig: (newConfig) =>
      set((state) => ({
        config: {
          ...state.config,
          ...newConfig,
          settings: {
            ...state.config.settings,
            ...newConfig.settings,
          },
        },
      })),
    reset: () => set(initialState),
  }),
)
