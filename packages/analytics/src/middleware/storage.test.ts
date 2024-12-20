import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { LocalStorageAdapter, MemoryStorageAdapter } from './storage'

describe('Storage Adapters', () => {
  describe('LocalStorageAdapter', () => {
    let mockStorage: Record<string, string> = {}
    let adapter: LocalStorageAdapter

    beforeEach(() => {
      // Mock localStorage
      global.localStorage = {
        getItem: vi.fn((key) => mockStorage[key] || null),
        setItem: vi.fn((key, value) => {
          mockStorage[key] = value.toString()
        }),
        removeItem: vi.fn((key) => {
          delete mockStorage[key]
        }),
        clear: vi.fn(() => {
          mockStorage = {}
        }),
        length: 0,
        key: vi.fn(),
      }

      adapter = new LocalStorageAdapter()
    })

    afterEach(() => {
      vi.clearAllMocks()
      mockStorage = {}
    })

    it('should set and get values', () => {
      adapter.set('test-key', 'test-value')
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'test-key',
        'test-value',
      )
      expect(adapter.get('test-key')).toBe('test-value')
      expect(localStorage.getItem).toHaveBeenCalledWith('test-key')
    })

    it('should remove values', () => {
      adapter.set('test-key', 'test-value')
      adapter.remove('test-key')
      expect(localStorage.removeItem).toHaveBeenCalledWith('test-key')
      expect(adapter.get('test-key')).toBeNull()
    })

    it('should handle non-existent keys', () => {
      expect(adapter.get('non-existent')).toBeNull()
    })

    it('should handle storage errors gracefully', () => {
      const mockError = new Error('Storage error')
      vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw mockError
      })

      // Should not throw
      adapter.set('test-key', 'test-value')
      expect(localStorage.setItem).toHaveBeenCalled()
    })
  })

  describe('MemoryStorageAdapter', () => {
    let adapter: MemoryStorageAdapter

    beforeEach(() => {
      adapter = new MemoryStorageAdapter()
    })

    it('should set and get values', () => {
      adapter.set('test-key', 'test-value')
      expect(adapter.get('test-key')).toBe('test-value')
    })

    it('should remove values', () => {
      adapter.set('test-key', 'test-value')
      adapter.remove('test-key')
      expect(adapter.get('test-key')).toBeNull()
    })

    it('should handle non-existent keys', () => {
      expect(adapter.get('non-existent')).toBeNull()
    })

    it('should maintain separate storage instances', () => {
      const adapter1 = new MemoryStorageAdapter()
      const adapter2 = new MemoryStorageAdapter()

      adapter1.set('key', 'value1')
      adapter2.set('key', 'value2')

      expect(adapter1.get('key')).toBe('value1')
      expect(adapter2.get('key')).toBe('value2')
    })

    it('should handle multiple operations', () => {
      adapter.set('key1', 'value1')
      adapter.set('key2', 'value2')
      adapter.remove('key1')
      adapter.set('key2', 'updated')

      expect(adapter.get('key1')).toBeNull()
      expect(adapter.get('key2')).toBe('updated')
    })
  })
})
