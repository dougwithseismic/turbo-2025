# API Reference

Complete API documentation for the Analytics Platform.

## Analytics Class

The main class for initializing and using the analytics platform.

### Constructor

```typescript
constructor(options: AnalyticsOptions = {})
```

Options:

- `plugins?: Plugin[]` - Array of analytics plugins
- `middleware?: Middleware[]` - Array of middleware
- `debug?: boolean` - Enable debug mode
- `errorHandler?: ErrorHandler` - Custom error handler

### Methods

#### initialize

```typescript
async initialize(): Promise<void>
```

Initializes all configured plugins. Must be called before tracking events.

#### registerEvent

```typescript
registerEvent(name: string, schema: z.ZodSchema): void
```

Registers a custom event with a validation schema. The schema will be used to validate properties when tracking this event.

#### getEventSchema

```typescript
getEventSchema(name: string): z.ZodSchema | undefined
```

Retrieves the validation schema for a registered custom event.

#### track

```typescript
async track<T extends EventName>(
  name: T,
  properties?: EventProperties[T]
): Promise<void>
```

Tracks a custom event with optional properties. Properties will be validated against the registered schema for custom events.

#### page

```typescript
async page(pageView: PageView): Promise<void>
```

Tracks a page view.

#### identify

```typescript
async identify(
  userId: string,
  traits?: Record<string, unknown>
): Promise<void>
```

Identifies a user with optional traits.

#### use

```typescript
use(plugin: Plugin): void
```

Adds a new plugin to the analytics instance.

#### remove

```typescript
remove(pluginName: string): void
```

Removes a plugin by name.

## Plugin Interface

Interface for creating analytics plugins.

```typescript
interface Plugin {
  name: string;
  initialize(): Promise<void>;
  track<T extends EventName>(event: AnalyticsEvent<T>): Promise<void>;
  page(pageView: PageView): Promise<void>;
  identify(identity: Identity): Promise<void>;
  loaded(): boolean;
  destroy?(): Promise<void>;
}
```

## Middleware Interface

Interface for creating middleware.

```typescript
interface Middleware {
  name: string;
  process<M extends keyof PluginMethodData>(
    method: M,
    data: PluginMethodData[M],
    next: (data: PluginMethodData[M]) => Promise<void>
  ): Promise<void>;
}
```

## Event Types

### AnalyticsEvent

```typescript
interface AnalyticsEvent<T extends EventName = EventName> {
  name: T;
  properties?: T extends keyof EventProperties
    ? EventProperties[T]
    : Record<string, unknown>;
  timestamp?: number;
}
```

### PageView

```typescript
interface PageView {
  path: string;
  title?: string;
  referrer?: string;
  properties?: Record<string, unknown>;
  timestamp?: number;
}
```

### Identity

```typescript
interface Identity {
  userId: string;
  traits?: Record<string, unknown>;
  timestamp?: number;
}
```

## Error Types

### AnalyticsError

Base class for all analytics errors.

```typescript
class AnalyticsError extends Error {
  readonly category: ErrorCategory;
  readonly timestamp: number;
  readonly context?: Record<string, unknown>;
}
```

### Error Categories

```typescript
enum ErrorCategory {
  INITIALIZATION = 'initialization',
  TRACKING = 'tracking',
  PLUGIN = 'plugin',
  MIDDLEWARE = 'middleware',
  VALIDATION = 'validation',
  CONFIGURATION = 'configuration'
}
```

## Built-in Plugins

### GoogleTagManagerPlugin

```typescript
class GoogleTagManagerPlugin implements Plugin {
  constructor(config: {
    containerId: string;
    dataLayerName?: string;
  });
}
```

### ConsolePlugin

```typescript
class ConsolePlugin implements Plugin {
  constructor(options?: { enabled?: boolean });
}
```

### DebugPlugin

```typescript
class DebugPlugin implements Plugin {
  constructor();
}
```

## Built-in Middleware

### ValidationMiddleware

```typescript
class ValidationMiddleware implements Middleware {
  constructor(options?: {
    strict?: boolean;
    minEventNameLength?: number;
    maxEventNameLength?: number;
  });
}
```

### BatchMiddleware

```typescript
class BatchMiddleware implements Middleware {
  constructor(options?: {
    maxSize?: number;      // Maximum number of events in a batch (default: 10)
    maxWait?: number;      // Maximum time to wait before sending a batch (default: 5000ms)
    flushOnUnload?: boolean; // Whether to flush events when page unloads (default: true)
    maxRetries?: number;   // Maximum number of retry attempts for failed batches (default: 3)
  });
}
```

### SessionMiddleware

## Batching & Offline Support

The Analytics Platform provides robust event batching and offline support through the BatchMiddleware.

### Batch Processing

Events are automatically batched for efficient network usage:

```typescript
const analytics = new Analytics({
  middleware: [
    new BatchMiddleware({
      maxSize: 10,        // Process in batches of 10 events
      maxWait: 5000,      // Or every 5 seconds
      flushOnUnload: true // Send remaining events before page unload
    })
  ]
});
```

Configuration options:

- `maxSize` (default: 10): Maximum number of events to batch before processing
- `maxWait` (default: 5000): Maximum time in milliseconds to wait before processing a batch
- `flushOnUnload` (default: true): Whether to process remaining events when the page unloads
- `maxRetries` (default: 3): Maximum number of retry attempts for failed batches

### Offline Support

The BatchMiddleware includes built-in offline support with the following features:

1. **Automatic Online/Offline Detection**
   - Monitors browser's online/offline status
   - Automatically switches between online/offline modes
   - Handles rapid connection state changes

2. **Event Persistence**
   - Automatically stores events in localStorage when offline
   - Uses 'analytics_queue' as the storage key
   - Preserves complete event data and metadata
   - Persists across page reloads and browser sessions

3. **Queue Processing**
   - Automatically processes stored events when connection is restored
   - Maintains strict event ordering (FIFO)
   - Processes offline queue before new events
   - Clears queue after successful processing

4. **Error Handling**
   - Retries failed events up to maxRetries times
   - Preserves events in queue if processing fails
   - Handles errors during offline storage
   - Provides graceful degradation

Example usage with offline support:

```typescript
// Configure analytics with offline support
const analytics = new Analytics({
  middleware: [
    new BatchMiddleware({
      maxSize: 10,
      maxWait: 5000,
      flushOnUnload: true,
      maxRetries: 3
    })
  ]
});

// Track events normally - they'll be queued if offline
await analytics.track('button_click', {
  button_id: 'signup',
  timestamp: Date.now()
});

// Events are automatically stored when offline
await analytics.track('purchase', {
  product_id: 'prod_123',
  amount: 99.99
});

// When back online:
// 1. Stored events are processed in order
// 2. New events are processed normally
// 3. Queue is automatically cleared
```

### Handling Network Changes

The BatchMiddleware automatically handles network state changes:

```typescript
// Events are queued while offline
await analytics.track('form_submit', {
  form_id: 'signup',
  success: true
});

// Network restored - events are processed automatically
// No manual intervention needed

// New events are processed normally
await analytics.track('page_view', {
  path: '/dashboard'
});
```

### Error Recovery

The middleware includes built-in error recovery:

```typescript
// If processing fails, events are:
// 1. Kept in queue
// 2. Retried up to maxRetries times
// 3. Preserved if retries fail
// 4. Processed when conditions improve
```

```typescript
class SessionMiddleware implements Middleware {
  constructor(config?: {
    timeout?: number;
    storageKey?: string;
    persistSession?: boolean;
    trackSessionEvents?: boolean;
  });
}
```

### ConsentMiddleware

```typescript
class ConsentMiddleware implements Middleware {
  constructor(config: {
    requiredCategories: ConsentCategory[];
    storageKey?: string;
    defaultPreferences?: Partial<ConsentPreferences>;
    queueEvents?: boolean;
  });
}
```

## Utility Types

### EventProperties

```typescript
type EventProperties = {
  [K in EventName]: K extends keyof EventTypeMap
    ? EventTypeMap[K]
    : Record<string, unknown>;
}
```

### BaseProperties

```typescript
interface BaseProperties {
  timestamp?: number;
  path?: string;
  url?: string;
  referrer?: string;
  title?: string;
  search?: string;
}
```

### ConsentPreferences

```typescript
interface ConsentPreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  advertising: boolean;
  social: boolean;
}
```

## Error Handler Interface

```typescript
interface ErrorHandler {
  handleError(error: AnalyticsError): void | Promise<void>;
}
```

## Storage Adapter Interface

```typescript
interface StorageAdapter {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
}
```

## Script Loader Options

```typescript
interface ScriptOptions {
  async?: boolean;
  defer?: boolean;
  id?: string;
  retries?: number;
  retryDelay?: number;
  cleanup?: boolean;
  attributes?: Record<string, string>;
}
```

## Type Utilities

### Event Type Inference

```typescript
type EventPropertiesFor<
  T extends EventName,
  R extends CustomEventRegistry = CustomEventRegistry
> = T extends keyof EventProperties
  ? EventProperties[T]
  : Record<string, unknown>;
```

### Plugin Method Data

```typescript
type PluginMethodData = {
  track: AnalyticsEvent;
  page: PageView;
  identify: Identity;
}
```

## Next Steps

- See [Getting Started](./getting-started.md) for basic usage
- Learn about [Core Concepts](./core-concepts.md)
- Explore [Plugins](./plugins.md) and [Middleware](./middleware.md)
- Check [Event Tracking](./event-tracking.md) for event types
