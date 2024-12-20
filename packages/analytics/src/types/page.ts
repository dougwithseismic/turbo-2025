import type { BaseProperties } from './events'

export interface PageView extends BaseProperties {
  path: string
  title?: string
  properties?: Record<string, unknown>
  timestamp: number
}
