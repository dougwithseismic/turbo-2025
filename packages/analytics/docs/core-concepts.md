# Core Concepts

The Analytics Platform is built around several key concepts that work together to provide a flexible and powerful analytics solution.

## Architecture Overview

```
┌─────────────────┐
│    Analytics    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Middleware    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Plugins      │
└─────────────────┘
```

### Core Components

1. **Analytics Core**: The main entry point that coordinates event tracking, middleware, and plugins
2. **Middleware**: Processes events before they reach plugins
3. **Plugins**: Sends data to specific analytics providers
4. **Event System**: Defines and validates analytics events
5. **Session Management**: Tracks user sessions and activity

## Analytics Core

The Analytics core (`Analytics` class) is responsible for:

- Managing plugins and middleware
- Providing the main tracking methods (`track`, `page`, `identify`)
- Coordinating event flow through middleware to plugins
- Error handling and validation

```typescript
const analytics = new Analytics({
  plugins: [...],
  middleware: [...],
  debug: true
});
```

## Event Flow

When an event is tracked, it flows through the system in this order:

1. Event is created with timestamp and properties
2. Middleware processes the event (validation, batching, etc.)
3. Each plugin receives the processed event
4. Plugins send the event to their respective analytics providers

```
Event → Middleware 1 → Middleware 2 → Plugin 1
                                   → Plugin 2
                                   → Plugin N
```

## Event Types

The platform supports several built-in event types:

- **Page Views**: Track when users view pages
- **Custom Events**: Track specific user actions
- **Identity Events**: Track user identification and traits

Each event type has a defined schema that validates its properties:

```typescript
// Page View Event
analytics.page({
  path: '/products',
  title: 'Products Page'
});

// Custom Event
analytics.track('button_click', {
  button_id: 'signup',
  button_text: 'Sign Up'
});

// Identity Event
analytics.identify('user123', {
  email: 'user@example.com',
  plan: 'premium'
});
```

## Plugin System

Plugins are responsible for sending data to specific analytics providers. Each plugin must implement:

```typescript
interface Plugin {
  name: string;
  initialize(): Promise<void>;
  track(event: AnalyticsEvent): Promise<void>;
  page(pageView: PageView): Promise<void>;
  identify(identity: Identity): Promise<void>;
  loaded(): boolean;
}
```

## Middleware System

Middleware can transform or enhance events before they reach plugins. Common use cases include:

- **Validation**: Ensure events match their schemas
- **Batching**: Group events for efficient processing
- **Session**: Add session information to events
- **Consent**: Handle user privacy preferences

```typescript
interface Middleware {
  name: string;
  process(method: string, data: unknown, next: Function): Promise<void>;
}
```

## Session Management

The platform includes built-in session management that:

- Tracks session duration and activity
- Handles session timeouts
- Persists session data (optional)
- Works across page loads

```typescript
const sessionMiddleware = new SessionMiddleware({
  timeout: 30 * 60 * 1000, // 30 minutes
  persistSession: true
});
```

## Error Handling

The platform provides robust error handling:

- Plugin operation errors
- Validation errors
- Middleware errors
- Configuration errors

Each error type includes:

- Error category
- Detailed context
- Timestamp
- Original error (if applicable)

```typescript
interface AnalyticsError {
  category: ErrorCategory;
  message: string;
  context?: Record<string, unknown>;
  timestamp: number;
}
```

## Type Safety

The platform is built with TypeScript and provides:

- Type definitions for all events
- Validation schemas
- Plugin and middleware interfaces
- Configuration types

This ensures type safety during development and helps catch errors early.

## Next Steps

- Learn how to [create plugins](./plugins.md)
- Understand [middleware development](./middleware.md)
- See [event tracking](./event-tracking.md) for all event types
- Check the [API reference](./api-reference.md) for detailed documentation
