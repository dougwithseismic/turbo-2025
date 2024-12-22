import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { LocalStorageAdapter, MemoryStorageAdapter } from './storage'

describe('Storage', () => {
  describe('MemoryStorageAdapter', () => {
    let storage: MemoryStorageAdapter

    beforeEach(() => {
      storage = new MemoryStorageAdapter()
    })

    it('should store and retrieve values', () => {
      storage.set('key1', 'value1')
      expect(storage.get('key1')).toBe('value1')
    })

    it('should return null for non-existent keys', () => {
      expect(storage.get('nonexistent')).toBeNull()
    })

    it('should remove values', () => {
      storage.set('key1', 'value1')
      storage.remove('key1')
      expect(storage.get('key1')).toBeNull()
    })

    it('should update existing values', () => {
      storage.set('key1', 'value1')
      storage.set('key1', 'value2')
      expect(storage.get('key1')).toBe('value2')
    })
  })

  describe('LocalStorageAdapter', () => {
    let storage: LocalStorageAdapter
    let mockLocalStorage: Storage

    beforeEach(() => {
      mockLocalStorage = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        key: vi.fn(),
        length: 0,
      }

      // Mock localStorage
      global.localStorage = mockLocalStorage
      storage = new LocalStorageAdapter()

      // Mock console.warn to keep test output clean
      vi.spyOn(console, 'warn').mockImplementation(() => {})
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('should store and retrieve values', () => {
      ;(mockLocalStorage.getItem as jest.Mock).mockReturnValue('value1')

      storage.set('key1', 'value1')
      const value = storage.get('key1')

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('key1', 'value1')
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('key1')
      expect(value).toBe('value1')
    })

    it('should handle localStorage.getItem errors', () => {
      ;(mockLocalStorage.getItem as jest.Mock).mockImplementation(() => {
        throw new Error('Storage error')
      })

      const value = storage.get('key1')

      expect(console.warn).toHaveBeenCalledWith(
        '[Analytics] Failed to get item from localStorage:',
        expect.any(Error),
      )
      expect(value).toBeNull()
    })

    it('should handle localStorage.setItem errors', () => {
      ;(mockLocalStorage.setItem as jest.Mock).mockImplementation(() => {
        throw new Error('Storage error')
      })

      storage.set('key1', 'value1')

      expect(console.warn).toHaveBeenCalledWith(
        '[Analytics] Failed to set item in localStorage:',
        expect.any(Error),
      )
    })

    it('should handle localStorage.removeItem errors', () => {
      ;(mockLocalStorage.removeItem as jest.Mock).mockImplementation(() => {
        throw new Error('Storage error')
      })

      storage.remove('key1')

      expect(console.warn).toHaveBeenCalledWith(
        '[Analytics] Failed to remove item from localStorage:',
        expect.any(Error),
      )
    })

    it('should remove values', () => {
      storage.remove('key1')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('key1')
    })
  })
})
