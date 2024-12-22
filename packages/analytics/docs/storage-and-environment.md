# Storage and Environment Support

The Analytics Platform provides robust storage handling and environment detection to ensure proper functionality across different contexts.

## Storage System

### Storage Adapters

The platform uses storage adapters to abstract storage operations:

```typescript
interface StorageAdapter {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
}
```

#### LocalStorageAdapter

For browser environments:

```typescript
class LocalStorageAdapter implements StorageAdapter {
  get(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('[Analytics] Failed to get item from localStorage:', error);
      return null;
    }
  }

  set(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn('[Analytics] Failed to set item in localStorage:', error);
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('[Analytics] Failed to remove item from localStorage:', error);
    }
  }
}
```

#### MemoryStorageAdapter

For server or testing environments:

```typescript
class MemoryStorageAdapter implements StorageAdapter {
  private store: Map<string, string> = new Map();

  get(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  set(key: string, value: string): void {
    this.store.set(key, value);
  }

  remove(key: string): void {
    this.store.delete(key);
  }
}
```

## Environment Detection

The platform automatically detects the current environment:

```typescript
interface Environment {
  isServer: boolean;
  isClient: boolean;
  isTest: boolean;
}

function detectEnvironment(config?: {
  isServer?: boolean;
  isClient?: boolean;
  isTest?: boolean;
}): Environment {
  if (config) {
    return {
      isServer: config.isServer ?? false,
      isClient: config.isClient ?? false,
      isTest: config.isTest ?? false,
    };
  }

  const isTest = process.env.NODE_ENV === 'test';
  const isClient = !isTest && typeof window !== 'undefined';
  const isServer = !isTest && !isClient;

  return { isServer, isClient, isTest };
}
```

### Usage

```typescript
const env = detectEnvironment();

if (env.isClient) {
  // Use browser-specific features
  const storage = new LocalStorageAdapter();
} else if (env.isServer) {
  // Use server-safe alternatives
  const storage = new MemoryStorageAdapter();
}
```

## Session Storage

### Session Data Structure

```typescript
interface SessionData {
  id: string;
  startedAt: number;
  lastActivityAt: number;
  pageViews: number;
  events: number;
  referrer?: string;
  initialPath?: string;
  userId?: string;
}
```

### Session Store Configuration

```typescript
interface SessionStoreConfig {
  timeout?: number;           // Session timeout in ms
  storageKey?: string;       // Storage key for session data
  persistSession?: boolean;   // Whether to persist across page loads
  storeType?: StoreType;     // Force specific store type
  environment?: Environment;  // Force specific environment
}
```

### Session Store Implementation

```typescript
class SharedSessionStore implements SessionStore {
  private currentSession: SessionData | null = null;
  private activityTimer: ReturnType<typeof setTimeout> | null = null;
  private storage: StorageAdapter;
  private timeout: number;
  private storageKey: string;
  private persistSession: boolean;
  private env: Environment;

  constructor(config: SessionStoreConfig = {}) {
    this.timeout = config.timeout ?? 1800000; // 30 minutes
    this.storageKey = config.storageKey ?? 'analytics_session';
    this.persistSession = config.persistSession ?? true;
    this.env = detectEnvironment(config.environment);
    this.storage = getStorageAdapter(config.storeType, this.env);

    if (this.env.isClient && this.persistSession) {
      this.loadSession();
    } else {
      this.startSession();
    }
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private startSession(): void {
    this.currentSession = {
      id: this.generateSessionId(),
      startedAt: Date.now(),
      lastActivityAt: Date.now(),
      pageViews: 0,
      events: 0,
      referrer: this.env.isClient ? document.referrer : undefined,
      initialPath: this.env.isClient ? window.location.pathname : undefined,
    };

    this.saveSession();
    this.scheduleTimeout();
  }

  handleActivity(): void {
    if (!this.currentSession) {
      this.startSession();
      return;
    }

    if (this.isExpired()) {
      this.currentSession = null;
      return;
    }

    this.currentSession.lastActivityAt = Date.now();
    this.saveSession();
    this.scheduleTimeout();
  }

  destroy(): void {
    this.clearSession();
    this.currentSession = null;
    if (this.activityTimer) {
      clearTimeout(this.activityTimer);
    }
    if (this.persistSession) {
      this.storage.remove(this.storageKey);
    }
  }
}
```

## Environment-Specific Features

### Browser Environment

Features available in browser environments:

```typescript
if (typeof window !== 'undefined') {
  // Session persistence
  window.addEventListener('beforeunload', (event) => {
    event.preventDefault();
    const flushPromise = sessionStore.save();
    event.returnValue = '';
    return flushPromise;
  });

  // Activity tracking
  window.addEventListener('focus', () => {
    sessionStore.handleActivity();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      sessionStore.handleActivity();
    }
  });
}
```

### Server Environment

Server-safe implementations:

```typescript
if (typeof window === 'undefined') {
  // Use memory storage
  const storage = new MemoryStorageAdapter();

  // Skip DOM-dependent features
  const sessionStore = new SharedSessionStore({
    persistSession: false,
    storeType: StoreType.Memory
  });
}
```

## Cross-Environment Best Practices

1. **Environment Detection**

```typescript
class CrossEnvironmentPlugin implements Plugin {
  async initialize(): Promise<void> {
    const env = detectEnvironment();
    
    if (env.isClient) {
      await this.initializeBrowser();
    } else if (env.isServer) {
      await this.initializeServer();
    }
  }

  private async initializeBrowser(): Promise<void> {
    // Browser-specific initialization
  }

  private async initializeServer(): Promise<void> {
    // Server-specific initialization
  }
}
```

2. **Feature Detection**

```typescript
class SafePlugin implements Plugin {
  private hasLocalStorage(): boolean {
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      return true;
    } catch {
      return false;
    }
  }

  async initialize(): Promise<void> {
    this.storage = this.hasLocalStorage()
      ? new LocalStorageAdapter()
      : new MemoryStorageAdapter();
  }
}
```

3. **Graceful Degradation**

```typescript
class AdaptivePlugin implements Plugin {
  private getStorage(): StorageAdapter {
    const env = detectEnvironment();
    
    if (env.isClient && this.hasLocalStorage()) {
      return new LocalStorageAdapter();
    }
    
    return new MemoryStorageAdapter();
  }

  private hasLocalStorage(): boolean {
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      return true;
    } catch {
      return false;
    }
  }
}
```

## Testing Considerations

1. **Environment Mocking**

```typescript
describe('Storage', () => {
  it('should use memory storage in test environment', () => {
    const store = new SharedSessionStore({
      environment: { isTest: true }
    });
    expect(store.storage).toBeInstanceOf(MemoryStorageAdapter);
  });
});
```

2. **Storage Mocking**

```typescript
describe('LocalStorage', () => {
  let mockStorage: Storage;

  beforeEach(() => {
    mockStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      key: vi.fn(),
      length: 0
    };
    global.localStorage = mockStorage;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should handle storage operations', () => {
    const adapter = new LocalStorageAdapter();
    adapter.set('key', 'value');
    expect(mockStorage.setItem).toHaveBeenCalledWith('key', 'value');
  });
});
```

## Next Steps

- Learn about [Validation and Types](./validation-and-types.md)
- Understand [Testing Guide](./testing-guide.md)
- See [Performance and Security](./performance-and-security.md)
- Check [Error Handling](./error-handling.md)
