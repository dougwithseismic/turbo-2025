/**
 * Interface for storage adapters used by session management
 */
export interface StorageAdapter {
  /** Get value by key */
  get(key: string): string | null
  /** Set value for key */
  set(key: string, value: string): void
  /** Remove value by key */
  remove(key: string): void
}

/**
 * Storage adapter that uses browser's localStorage
 */
export class LocalStorageAdapter implements StorageAdapter {
  get(key: string): string | null {
    try {
      return localStorage.getItem(key)
    } catch (error) {
      console.warn('[Analytics] Failed to get item from localStorage:', error)
      return null
    }
  }

  set(key: string, value: string): void {
    try {
      localStorage.setItem(key, value)
    } catch (error) {
      console.warn('[Analytics] Failed to set item in localStorage:', error)
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.warn(
        '[Analytics] Failed to remove item from localStorage:',
        error,
      )
    }
  }
}

/**
 * In-memory storage adapter for non-browser environments
 */
export class MemoryStorageAdapter implements StorageAdapter {
  private store: Map<string, string> = new Map()

  get(key: string): string | null {
    return this.store.get(key) ?? null
  }

  set(key: string, value: string): void {
    this.store.set(key, value)
  }

  remove(key: string): void {
    this.store.delete(key)
  }
}
