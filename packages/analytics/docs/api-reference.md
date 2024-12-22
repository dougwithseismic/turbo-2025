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

#### track

```typescript
async track<T extends EventName>(
  name: T,
  properties?: EventProperties[T]
): Promise<void>
```

Tracks a custom event with optional properties.

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
    maxSize?: number;
    maxWait?: number;
    flushOnUnload?: boolean;
    maxRetries?: number;
  });
}
```

### SessionMiddleware

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
