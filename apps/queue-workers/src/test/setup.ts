import { vi, beforeEach } from 'vitest'

// Mock crypto for UUID generation
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn(() => '123e4567-e89b-12d3-a456-426614174000'),
  },
})

// Mock fetch
global.fetch = vi.fn()

// Mock DOMParser for XML parsing
class MockDOMParser {
  parseFromString(str: string, type: string) {
    return {
      querySelectorAll: (selector: string) => {
        if (selector === 'loc') {
          return [
            { textContent: 'https://example.com/page1' },
            { textContent: 'https://example.com/page2' },
          ]
        }
        return []
      },
    }
  }
}

global.DOMParser = MockDOMParser as any

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(fetch).mockReset()
  vi.mocked(fetch).mockImplementation(() =>
    Promise.resolve({
      ok: true,
      text: () => Promise.resolve('<sitemap></sitemap>'),
    } as Response),
  )
})
