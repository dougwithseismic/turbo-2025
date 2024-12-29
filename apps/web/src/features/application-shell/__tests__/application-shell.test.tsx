import { describe, expect, it } from 'vitest'
import { ApplicationShell } from '../components/application-shell'

describe('ApplicationShell', () => {
  it('should be defined', () => {
    expect(ApplicationShell).toBeDefined()
  })

  it('should have correct name', () => {
    expect(ApplicationShell.name).toBe('ApplicationShell')
  })

  it('should be a valid function component', () => {
    expect(typeof ApplicationShell).toBe('function')
  })

  it('should accept valid props', () => {
    const props = {
      children: <div>Test Content</div>,
    }

    // Type check should pass
    const validProps: Parameters<typeof ApplicationShell>[0] = props
    expect(validProps).toEqual(props)
  })
})
