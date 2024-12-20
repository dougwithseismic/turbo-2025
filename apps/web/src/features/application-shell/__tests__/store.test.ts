import { describe, expect, it, beforeEach } from 'vitest'
import { useApplicationShellStore } from '../store'

describe('ApplicationShellStore', () => {
  beforeEach(() => {
    useApplicationShellStore.setState({
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
    })
  })

  it('should initialize with default state', () => {
    const state = useApplicationShellStore.getState()
    expect(state).toEqual({
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
      setData: expect.any(Function),
      setLoading: expect.any(Function),
      setError: expect.any(Function),
      updateConfig: expect.any(Function),
      reset: expect.any(Function),
    })
  })

  it('should update loading state', () => {
    useApplicationShellStore.getState().setLoading(true)
    expect(useApplicationShellStore.getState().isLoading).toBe(true)
  })

  it('should update config', () => {
    useApplicationShellStore.getState().updateConfig({
      enabled: false,
      settings: { timeout: 1000 },
    })

    const { config } = useApplicationShellStore.getState()
    expect(config.enabled).toBe(false)
    expect(config.settings.timeout).toBe(1000)
    // Original values should be preserved
    expect(config.settings.maxRetries).toBe(3)
  })

  it('should reset to initial state', () => {
    // Set some values
    useApplicationShellStore.setState({
      data: { test: true },
      isLoading: true,
      error: new Error('test'),
    })

    // Reset
    useApplicationShellStore.getState().reset()

    // Verify reset
    expect(useApplicationShellStore.getState()).toEqual({
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
      setData: expect.any(Function),
      setLoading: expect.any(Function),
      setError: expect.any(Function),
      updateConfig: expect.any(Function),
      reset: expect.any(Function),
    })
  })
})
