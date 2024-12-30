import { vi } from 'vitest'
import type { PageAnalysis } from '../types.improved'

export type MockFunction = ReturnType<typeof vi.fn>

export interface MockBrowserContext {
  setUserAgent: MockFunction
  exposeBinding: MockFunction
  addInitScript: MockFunction
  removeAllListeners: MockFunction
  on: MockFunction
}

export const createMockPage = () => ({
  goto: vi.fn(),
  evaluate: vi.fn(),
  setExtraHTTPHeaders: vi.fn(),
  context: vi.fn().mockReturnValue({
    setUserAgent: vi.fn(),
    exposeBinding: vi.fn(),
    addInitScript: vi.fn(),
    removeAllListeners: vi.fn(),
    on: vi.fn(),
  }),
  close: vi.fn(),
})

export const createMockAnalysis = (
  overrides: Partial<PageAnalysis> = {},
): PageAnalysis => ({
  url: 'https://example.com',
  status: 200,
  redirectChain: [],
  timing: {
    start: 0,
    domContentLoaded: 100,
    loaded: 200,
  },
  title: 'Test Page',
  description: 'Test description',
  h1: 'Test Heading',
  metaTags: [],
  headings: { h1: [], h2: [], h3: [] },
  wordCount: 1000,
  readingTime: 5,
  images: [],
  links: [],
  loadTime: 200,
  contentLength: 5000,
  resourceSizes: {
    html: 5000,
    css: 10000,
    javascript: 50000,
    images: 100000,
    fonts: 20000,
    other: 1000,
  },
  security: {
    https: true,
    headers: {},
  },
  coreWebVitals: {
    lcp: 2500,
    fid: 100,
    cls: 0.1,
    ttfb: 200,
    fcp: 1000,
  },
  mobileFriendliness: {
    isResponsive: true,
    viewportMeta: true,
    touchTargets: {
      total: 10,
      tooSmall: 0,
    },
    fontSize: {
      base: 16,
      readable: true,
    },
    mediaQueries: [],
  },
  schemaOrg: [],
  console: [],
  brokenResources: [],
  ...overrides,
})
