import { vi, beforeEach, afterEach } from 'vitest'

// Silence console.error for expected errors in tests
vi.spyOn(console, 'error').mockImplementation(() => {})

// Configure fake timers globally
beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
})

afterEach(() => {
  vi.useRealTimers()
  vi.clearAllMocks()
})
