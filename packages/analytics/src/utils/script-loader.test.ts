import { beforeEach, describe, expect, it, vi } from 'vitest'
import { scriptLoader } from './script-loader'

describe('ScriptLoader', () => {
  let mockScript: Partial<HTMLScriptElement>
  let mockEventHandlers: { [key: string]: Array<(event?: Event) => void> }
  let mockHead: { appendChild: (script: HTMLScriptElement) => void }
  let createElement: typeof document.createElement

  beforeAll(() => {
    // Handle expected rejections globally
    vi.stubGlobal('onunhandledrejection', (event: PromiseRejectionEvent) => {
      if (
        event.reason instanceof Error &&
        event.reason.message.includes('Failed to load script after')
      ) {
        event.preventDefault()
      }
    })
  })

  afterAll(() => {
    vi.unstubAllGlobals()
  })

  beforeEach(() => {
    // Reset script loader state
    scriptLoader['loadedScripts'].clear()
    vi.useFakeTimers()

    // Reset event handlers for each test
    mockEventHandlers = {
      load: [],
      error: [],
    }

    // Create mock script with proper event handling
    mockScript = {
      src: undefined,
      async: true,
      defer: false,
      remove: vi.fn(),
      setAttribute: vi.fn(),
      addEventListener: vi.fn(
        (event: string, handler: (event?: Event) => void) => {
          if (mockEventHandlers[event]) {
            mockEventHandlers[event].push(handler)
          }
        },
      ),
      removeEventListener: vi.fn(
        (event: string, handler: (event?: Event) => void) => {
          const handlers = mockEventHandlers[event]
          if (handlers) {
            const index = handlers.indexOf(handler)
            if (index > -1) {
              handlers.splice(index, 1)
            }
          }
        },
      ),
    }

    // Create a Proxy to handle property assignments
    const scriptProxy = new Proxy(mockScript, {
      set(target, prop, value) {
        // Ensure we're setting the property on the target object
        if (prop === 'async' || prop === 'defer' || prop === 'src') {
          target[prop] = value
        }
        return true
      },
      get(target, prop) {
        // Return the actual value from the target
        // @ts-expect-error - we know this is a valid property
        return target[prop]
      },
    })

    // Create mock head that can trigger script events
    mockHead = {
      appendChild: vi.fn((script: HTMLScriptElement) => {
        // Store the script to ensure we're working with the same instance
        Object.assign(mockScript, script)
        // By default, trigger load event after a tick
        setTimeout(() => {
          const handlers = mockEventHandlers.load
          if (handlers) {
            handlers.forEach((handler) => handler())
          }
        }, 0)
      }),
    }

    createElement = vi.fn(() => scriptProxy as HTMLScriptElement)

    // Mock DOM APIs
    vi.stubGlobal('document', {
      createElement,
      head: mockHead,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('should load a script successfully', async () => {
    const src = 'https://example.com/script.js'
    const loadPromise = scriptLoader.loadScript(src)

    // Advance timers to trigger load event
    await vi.runAllTimersAsync()

    await expect(loadPromise).resolves.toBeUndefined()
    expect(createElement).toHaveBeenCalledWith('script')
    expect(mockScript.src).toBe(src)
    expect(mockScript.async).toBe(true)
    expect(mockHead.appendChild).toHaveBeenCalled()
  })

  it('should handle script options', async () => {
    const src = 'https://example.com/script.js'
    const options = {
      async: false,
      defer: true,
      id: 'test-script',
      attributes: {
        'data-test': 'value',
        crossorigin: 'anonymous',
      },
    }

    const loadPromise = scriptLoader.loadScript(src, options)
    await vi.runAllTimersAsync()

    await expect(loadPromise).resolves.toBeUndefined()
    expect(mockScript.async).toBe(false)
    expect(mockScript.defer).toBe(true)
    expect(mockScript.setAttribute).toHaveBeenCalledWith('data-test', 'value')
    expect(mockScript.setAttribute).toHaveBeenCalledWith(
      'crossorigin',
      'anonymous',
    )
    expect(scriptLoader.isScriptLoaded(options.id)).toBe(true)
  })

  it('should prevent duplicate script loading', async () => {
    const src = 'https://example.com/script.js'
    const id = 'test-script'

    // Load the script first time
    const firstLoad = scriptLoader.loadScript(src, { id })
    await vi.runAllTimersAsync()
    await firstLoad

    // Reset the mock counts
    vi.clearAllMocks()

    // Try to load the same script again
    const secondLoad = scriptLoader.loadScript(src, { id })
    await secondLoad

    // Should not create a new script element or append to head for second load
    expect(createElement).not.toHaveBeenCalled()
    expect(mockHead.appendChild).not.toHaveBeenCalled()
  })

  it('should handle concurrent script loads', async () => {
    const src = 'https://example.com/script.js'
    const id = 'concurrent-script'

    // Start two loads of the same script simultaneously
    const firstLoad = scriptLoader.loadScript(src, { id })
    const secondLoad = scriptLoader.loadScript(src, { id })

    // Both promises should be the same instance
    expect(firstLoad).toEqual(secondLoad)

    // Complete the load
    await vi.runAllTimersAsync()

    // Both promises should resolve
    await expect(firstLoad).resolves.toBeUndefined()
    await expect(secondLoad).resolves.toBeUndefined()

    // Should only create one script element
    expect(createElement).toHaveBeenCalledTimes(1)
    expect(mockHead.appendChild).toHaveBeenCalledTimes(1)
  })

  it('should retry failed script loads', async () => {
    const src = 'https://example.com/script.js'
    const retries = 2
    const retryDelay = 100

    // Mock the error event for the first attempt
    mockEventHandlers.load = []
    mockEventHandlers.error = []
    const loadPromise = scriptLoader.loadScript(src, { retries, retryDelay })

    // Trigger error for first attempt
    mockEventHandlers.error[0]?.()
    await vi.advanceTimersByTimeAsync(retryDelay)

    // Script should be removed and reappended
    expect(mockScript.remove).toHaveBeenCalledTimes(1)
    expect(mockHead.appendChild).toHaveBeenCalledTimes(2)

    // Simulate successful load on retry
    mockEventHandlers.load[0]?.()
    await vi.runAllTimersAsync()

    await expect(loadPromise).resolves.toBeUndefined()
  })

  it('should fail after max retries', async () => {
    const src = 'https://example.com/script.js'
    const retries = 2
    const retryDelay = 100

    mockEventHandlers.error = []
    mockEventHandlers.load = []

    scriptLoader.loadScript(src, { retries, retryDelay })

    // Trigger initial error
    mockEventHandlers.error[0]?.()
    await vi.runAllTimersAsync()

    // Trigger errors for each retry
    for (let i = 0; i < retries; i++) {
      await vi.advanceTimersByTimeAsync(retryDelay)
      mockEventHandlers.error[0]?.()
      await vi.runAllTimersAsync()
    }

    expect(mockScript.remove).toHaveBeenCalledTimes(retries + 1)
    expect(mockHead.appendChild).toHaveBeenCalledTimes(retries + 1)
  })

  it('should clean up event listeners when cleanup is true', async () => {
    const src = 'https://example.com/script.js'
    const loadPromise = scriptLoader.loadScript(src, { cleanup: true })

    // Advance timers to trigger load event
    await vi.runAllTimersAsync()
    await loadPromise

    // Verify event listeners were removed after successful load
    expect(mockScript.removeEventListener).toHaveBeenCalledWith(
      'load',
      expect.any(Function),
    )
    expect(mockScript.removeEventListener).toHaveBeenCalledWith(
      'error',
      expect.any(Function),
    )
  })

  it('should clean up event listeners on error when cleanup is true', async () => {
    const src = 'https://example.com/script.js'
    const retries = 0
    const loadPromise = scriptLoader.loadScript(src, {
      cleanup: true,
      retries,
    })

    // Override default success behavior to trigger error
    const errorHandlers = mockEventHandlers.error
    if (errorHandlers && errorHandlers[0]) {
      errorHandlers[0]()
    }

    await expect(loadPromise).rejects.toThrow(
      `Failed to load script after ${retries} retries: ${src}`,
    )

    // Verify event listeners were removed after error
    expect(mockScript.removeEventListener).toHaveBeenCalledWith(
      'load',
      expect.any(Function),
    )
    expect(mockScript.removeEventListener).toHaveBeenCalledWith(
      'error',
      expect.any(Function),
    )
  })

  it('should clean up failed script from DOM after max retries', async () => {
    const src = 'https://example.com/script.js'
    const retries = 2
    const retryDelay = 100

    // Start with empty error handlers
    mockEventHandlers.error = []
    mockEventHandlers.load = []

    // Override default success behavior to always trigger error
    mockHead.appendChild = vi.fn((script: HTMLScriptElement) => {
      Object.assign(mockScript, script)
      // Trigger error on next tick to allow event listeners to be set up
      setTimeout(() => {
        const errorHandlers = mockEventHandlers.error
        if (errorHandlers && errorHandlers[0]) {
          errorHandlers[0]()
        }
      }, 0)
    })

    const loadPromise = scriptLoader.loadScript(src, { retries, retryDelay })

    // Wait for initial error
    await vi.runAllTimersAsync()

    // Advance timers for each retry attempt
    for (let i = 0; i < retries; i++) {
      await vi.advanceTimersByTimeAsync(retryDelay)
      await vi.runAllTimersAsync()
    }

    // Expect the promise to reject with the correct error
    await expect(loadPromise).rejects.toThrow(
      `Failed to load script after ${retries} retries: ${src}`,
    )

    // Verify script was removed from DOM after all retries failed
    expect(mockScript.remove).toHaveBeenCalledTimes(retries + 1)
  })

  it('should create new script element for each retry attempt', async () => {
    const src = 'https://example.com/script.js'
    const retries = 2
    const retryDelay = 100

    // Override default success behavior to trigger error for first two attempts
    let attemptCount = 0
    mockHead.appendChild = vi.fn((script: HTMLScriptElement) => {
      Object.assign(mockScript, script)
      attemptCount++
      if (attemptCount <= 2) {
        const errorHandlers = mockEventHandlers.error
        if (errorHandlers && errorHandlers[0]) {
          errorHandlers[0]()
        }
      } else {
        setTimeout(() => {
          const loadHandlers = mockEventHandlers.load
          if (loadHandlers && loadHandlers[0]) {
            loadHandlers[0]()
          }
        }, 0)
      }
    })

    const loadPromise = scriptLoader.loadScript(src, { retries, retryDelay })

    // Advance timers for retry attempts
    for (let i = 0; i < retries; i++) {
      await vi.advanceTimersByTimeAsync(retryDelay)
    }
    await vi.runAllTimersAsync()

    await expect(loadPromise).resolves.toBeUndefined()

    // Verify new script element was created for each attempt
    expect(createElement).toHaveBeenCalledTimes(3) // Initial + 2 retries
    expect(mockHead.appendChild).toHaveBeenCalledTimes(3)
  })
})
