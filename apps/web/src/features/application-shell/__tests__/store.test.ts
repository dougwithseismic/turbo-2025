import { describe, expect, it } from 'vitest'
import { useApplicationShellStore } from '../store'

describe('ApplicationShellStore', () => {
  it('should initialize with default state', () => {
    const state = useApplicationShellStore.getState()
    expect(state).toEqual({
      data: null,
      isLoading: false,
      error: null,
      isMobileSidebarOpen: false,
      isSidebarExpanded: true,
      isSidebarHovered: false,
      config: {
        enabled: true,
        settings: {
          maxRetries: 3,
          timeout: 5000,
        },
        sidebar: {
          width: 280,
          collapsedWidth: 56,
          enableHoverExpand: true,
          enableMobileDrawer: true,
          collapseOnMobileClick: true,
          collapseOnNavigate: true,
          enableLeftPadding: true,
          expandOnSearch: true,
        },
      },
      setData: expect.any(Function),
      setError: expect.any(Function),
      setLoading: expect.any(Function),
      setMobileSidebarOpen: expect.any(Function),
      setSidebarExpanded: expect.any(Function),
      setSidebarHovered: expect.any(Function),
      toggleSidebar: expect.any(Function),
      updateConfig: expect.any(Function),
      reset: expect.any(Function),
    })
  })

  it('should update loading state', () => {
    const store = useApplicationShellStore.getState()
    store.setLoading(true)
    expect(useApplicationShellStore.getState().isLoading).toBe(true)
  })

  it('should update config', () => {
    const store = useApplicationShellStore.getState()
    const newConfig = {
      enabled: false,
      settings: {
        maxRetries: 5,
        timeout: 10000,
      },
    }
    store.updateConfig(newConfig)
    expect(useApplicationShellStore.getState().config).toEqual({
      ...store.config,
      ...newConfig,
    })
  })

  it('should reset to initial state', () => {
    const store = useApplicationShellStore.getState()

    // Modify state
    store.setLoading(true)
    store.setData({ test: 'data' })
    store.setError(new Error('test error'))

    // Reset
    store.reset()

    // Verify reset
    expect(useApplicationShellStore.getState()).toEqual({
      data: null,
      isLoading: false,
      error: null,
      isMobileSidebarOpen: false,
      isSidebarExpanded: true,
      isSidebarHovered: false,
      config: {
        enabled: true,
        settings: {
          maxRetries: 3,
          timeout: 5000,
        },
        sidebar: {
          width: 280,
          collapsedWidth: 56,
          enableHoverExpand: true,
          enableMobileDrawer: true,
          collapseOnMobileClick: true,
          collapseOnNavigate: true,
          enableLeftPadding: true,
          expandOnSearch: true,
        },
      },
      setData: expect.any(Function),
      setError: expect.any(Function),
      setLoading: expect.any(Function),
      setMobileSidebarOpen: expect.any(Function),
      setSidebarExpanded: expect.any(Function),
      setSidebarHovered: expect.any(Function),
      toggleSidebar: expect.any(Function),
      updateConfig: expect.any(Function),
      reset: expect.any(Function),
    })
  })
})
