import { beforeAll, afterAll, vi } from 'vitest'

// Store original globals
const originalResizeObserver = global.ResizeObserver
const originalGetComputedStyle = global.getComputedStyle

// Create a minimal CSSStyleDeclaration mock
const createCSSStyleDeclarationMock = (): Partial<CSSStyleDeclaration> => ({
  getPropertyValue: vi.fn().mockReturnValue(''),
  setProperty: vi.fn(),
  removeProperty: vi.fn(),
  length: 0,
  parentRule: null,
  cssText: '',
  cssFloat: '',
})

beforeAll(() => {
  // Mock ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))

  // Mock getComputedStyle (needed for some Radix UI components)
  global.getComputedStyle = vi.fn(() => {
    return {
      ...createCSSStyleDeclarationMock(),
      // Add any specific styles needed for tests
      display: 'block',
      visibility: 'visible',
    } as CSSStyleDeclaration
  })

  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))

  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
})

afterAll(() => {
  // Restore original globals
  global.ResizeObserver = originalResizeObserver
  global.getComputedStyle = originalGetComputedStyle
})
