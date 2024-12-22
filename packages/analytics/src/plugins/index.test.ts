import { describe, expect, it } from 'vitest'
import {
  GoogleTagManagerPlugin,
  withGoogleTagManager,
  DebugPlugin,
  withDebug,
} from './index'

describe('plugins index', () => {
  it('should export GoogleTagManager plugin and factory', () => {
    expect(GoogleTagManagerPlugin).toBeDefined()
    expect(withGoogleTagManager).toBeDefined()

    const plugin = withGoogleTagManager({ containerId: 'GTM-TEST' })
    expect(plugin).toBeInstanceOf(GoogleTagManagerPlugin)
  })

  it('should export Debug plugin and factory', () => {
    expect(DebugPlugin).toBeDefined()
    expect(withDebug).toBeDefined()

    const plugin = withDebug()
    expect(plugin).toBeInstanceOf(DebugPlugin)
  })
})
