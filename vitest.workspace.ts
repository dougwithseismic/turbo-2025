import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  './packages/analytics/vitest.config.ts',
  './apps/web/vitest.config.mts',
  './apps/queue-workers/vitest.config.ts',
  './apps/api/vitest.config.ts',
])
