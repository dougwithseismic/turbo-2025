# Testing Guide

This guide covers testing strategies and utilities for the Analytics Platform.

## Test Setup

### Basic Setup

```typescript
import { Analytics } from '@your-org/analytics';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('Analytics', () => {
  let analytics: Analytics;

  beforeEach(() => {
    analytics = new Analytics({
      debug: true
    });
  });
});
```

### Mock Plugin

Create a mock plugin for testing:

```typescript
class MockPlugin implements Plugin {
  name = 'mock-plugin';
  initialize = vi.fn().mockResolvedValue(undefined);
  track = vi.fn().mockResolvedValue(undefined);
  page = vi.fn().mockResolvedValue(undefined);
  identify = vi.fn().mockResolvedValue(undefined);
  loaded = vi.fn().mockReturnValue(true);
}

describe('Plugin Integration', () => {
  let mockPlugin: MockPlugin;
  let analytics: Analytics;

  beforeEach(() => {
    mockPlugin = new MockPlugin();
    analytics = new Analytics({
      plugins: [mockPlugin]
    });
  });

  it('should initialize plugins', async () => {
    await analytics.initialize();
    expect(mockPlugin.initialize).toHaveBeenCalled();
  });
});
```

## Testing Events

### Event Tracking

```typescript
describe('Event Tracking', () => {
  it('should track events with properties', async () => {
    const mockPlugin = new MockPlugin();
    const analytics = new Analytics({ plugins: [mockPlugin] });
    
    await analytics.track('button_click', {
      button_id: 'test-button',
      button_text: 'Click Me'
    });

    expect(mockPlugin.track).toHaveBeenCalledWith({
      name: 'button_click',
      properties: {
        button_id: 'test-button',
        button_text: 'Click Me',
        timestamp: expect.any(Number)
      },
      timestamp: expect.any(Number)
    });
  });
});
```

### Page Views

```typescript
describe('Page Views', () => {
  it('should track page views', async () => {
    const mockPlugin = new MockPlugin();
    const analytics = new Analytics({ plugins: [mockPlugin] });
    
    await analytics.page({
      path: '/test',
      title: 'Test Page'
    });

    expect(mockPlugin.page).toHaveBeenCalledWith({
      path: '/test',
      title: 'Test Page',
      timestamp: expect.any(Number)
    });
  });
});
```

### User Identity

```typescript
describe('User Identity', () => {
  it('should identify users', async () => {
    const mockPlugin = new MockPlugin();
    const analytics = new Analytics({ plugins: [mockPlugin] });
    
    await analytics.identify('user123', {
      email: 'test@example.com',
      plan: 'premium'
    });

    expect(mockPlugin.identify).toHaveBeenCalledWith({
      userId: 'user123',
      traits: {
        email: 'test@example.com',
        plan: 'premium'
      },
      timestamp: expect.any(Number)
    });
  });
});
```

## Testing Middleware

### Validation Middleware

```typescript
describe('Validation Middleware', () => {
  it('should validate events', async () => {
    const middleware = new ValidationMiddleware();
    const next = vi.fn();
    
    const validEvent = {
      name: 'button_click',
      properties: {
        button_id: 'test-button'
      }
    };

    await middleware.process('track', validEvent, next);
    expect(next).toHaveBeenCalledWith(validEvent);
  });

  it('should reject invalid events', async () => {
    const middleware = new ValidationMiddleware();
    const next = vi.fn();
    
    const invalidEvent = {
      name: 'button_click',
      properties: {
        // Missing required button_id
      }
    };

    await expect(
      middleware.process('track', invalidEvent, next)
    ).rejects.toThrow();
    expect(next).not.toHaveBeenCalled();
  });
});
```

### Batch Middleware

```typescript
describe('Batch Middleware', () => {
  it('should batch events', async () => {
    const middleware = new BatchMiddleware({
      maxSize: 2,
      maxWait: 1000
    });
    const next = vi.fn();
    
    // First event
    await middleware.process('track', { name: 'event1' }, next);
    expect(next).toHaveBeenCalledTimes(1);
    
    // Second event (triggers batch)
    await middleware.process('track', { name: 'event2' }, next);
    expect(next).toHaveBeenCalledTimes(2);
  });

  it('should flush on timeout', async () => {
    vi.useFakeTimers();
    
    const middleware = new BatchMiddleware({
      maxSize: 5,
      maxWait: 1000
    });
    const next = vi.fn();
    
    await middleware.process('track', { name: 'event1' }, next);
    
    vi.advanceTimersByTime(1000);
    expect(next).toHaveBeenCalled();
    
    vi.useRealTimers();
  });
});
```

### Session Middleware

```typescript
describe('Session Middleware', () => {
  it('should add session data to events', async () => {
    const middleware = new SessionMiddleware();
    const next = vi.fn();
    
    await middleware.process('track', {
      name: 'test_event',
      properties: {}
    }, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      properties: expect.objectContaining({
        session_id: expect.any(String),
        session_page_views: expect.any(Number),
        session_events: expect.any(Number)
      })
    }));
  });
});
```

## Testing Storage

### Mock Storage Adapter

```typescript
describe('Storage', () => {
  let mockStorage: {
    getItem: ReturnType<typeof vi.fn>;
    setItem: ReturnType<typeof vi.fn>;
    removeItem: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn()
    };
    global.localStorage = mockStorage as Storage;
  });

  it('should store and retrieve data', () => {
    const adapter = new LocalStorageAdapter();
    adapter.set('key', 'value');
    expect(mockStorage.setItem).toHaveBeenCalledWith('key', 'value');
  });
});
```

## Testing Environment Detection

```typescript
describe('Environment Detection', () => {
  it('should detect browser environment', () => {
    const env = detectEnvironment();
    expect(env.isClient).toBe(true);
    expect(env.isServer).toBe(false);
  });

  it('should detect server environment', () => {
    delete (global as any).window;
    const env = detectEnvironment();
    expect(env.isServer).toBe(true);
    expect(env.isClient).toBe(false);
  });
});
```

## Testing Error Handling

```typescript
describe('Error Handling', () => {
  it('should handle plugin errors', async () => {
    const errorPlugin = new MockPlugin();
    errorPlugin.track.mockRejectedValue(new Error('Plugin error'));
    
    const errorHandler = {
      handleError: vi.fn()
    };

    const analytics = new Analytics({
      plugins: [errorPlugin],
      errorHandler
    });

    await analytics.track('test_event');
    expect(errorHandler.handleError).toHaveBeenCalled();
  });
});
```

## Testing Utilities

### Event Generator

```typescript
function createTestEvent(name: string, properties = {}) {
  return {
    name,
    properties,
    timestamp: Date.now()
  };
}

describe('Event Testing', () => {
  it('should process test events', async () => {
    const event = createTestEvent('button_click', {
      button_id: 'test'
    });
    
    await analytics.track(event.name, event.properties);
    // Assert expected behavior
  });
});
```

### Plugin Test Helper

```typescript
function createTestPlugin(overrides = {}) {
  return {
    name: 'test-plugin',
    initialize: vi.fn().mockResolvedValue(undefined),
    track: vi.fn().mockResolvedValue(undefined),
    page: vi.fn().mockResolvedValue(undefined),
    identify: vi.fn().mockResolvedValue(undefined),
    loaded: vi.fn().mockReturnValue(true),
    ...overrides
  };
}

describe('Plugin Testing', () => {
  it('should work with test plugin', async () => {
    const plugin = createTestPlugin({
      track: vi.fn().mockImplementation(async (event) => {
        // Custom tracking logic
      })
    });
    
    const analytics = new Analytics({ plugins: [plugin] });
    // Test analytics with plugin
  });
});
```

## Best Practices

1. **Isolate Tests**

```typescript
beforeEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});
```

2. **Mock Time-Based Operations**

```typescript
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});
```

3. **Test Error Cases**

```typescript
it('should handle errors', async () => {
  const error = new Error('Test error');
  mockPlugin.track.mockRejectedValue(error);
  
  await expect(analytics.track('test_event'))
    .rejects.toThrow('Test error');
});
```

4. **Test Async Operations**

```typescript
it('should handle async operations', async () => {
  const promise = analytics.track('test_event');
  await expect(promise).resolves.not.toThrow();
});
```

## Next Steps

- See [Performance and Security](./performance-and-security.md)
- Check [Error Handling](./error-handling.md)
- Review [Storage and Environment](./storage-and-environment.md)
- Learn about [Validation and Types](./validation-and-types.md)
