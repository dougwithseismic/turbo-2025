# Middleware

Middleware provides a way to process analytics events before they reach plugins. The Analytics Platform includes several built-in middleware options and allows you to create custom ones.

## Built-in Middleware

### Privacy Middleware

Handles data privacy and PII protection:

```typescript
import { PrivacyMiddleware } from '@your-org/analytics/middleware';

const privacyMiddleware = new PrivacyMiddleware({
  // Additional sensitive fields to remove
  sensitiveFields: ['custom_secret'],
  // Additional fields to hash
  hashFields: ['custom_field'],
  // Custom sanitizer function
  sanitizer: (data) => {
    // Your custom sanitization logic
    return data;
  }
});
```

The privacy middleware automatically:

- Removes sensitive fields (password, token, secret, creditCard, etc.)
- Hashes PII fields (email, phone, ip, userId)
- Handles nested objects
- Supports custom sanitization rules

Example usage:

```typescript
// Initialize analytics with privacy middleware
const analytics = new Analytics({
  middleware: [
    new PrivacyMiddleware()
  ]
});

// Track event - sensitive data will be automatically sanitized
await analytics.track('login', {
  email: 'user@example.com',     // Will be hashed
  password: 'secret123',         // Will be removed
  token: 'abc123',              // Will be removed
  safe_field: 'visible'         // Will be kept as-is
});

// Result will be:
// {
//   name: 'login',
//   properties: {
//     email_hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
//     safe_field: 'visible'
//   }
// }
```

### Validation Middleware

Ensures events match their defined schemas:

```typescript
import { ValidationMiddleware } from '@your-org/analytics/middleware';

const validationMiddleware = new ValidationMiddleware({
  strict: true, // Enable strict validation
  minEventNameLength: 1,
  maxEventNameLength: 100
});
```

### Batch Middleware

Groups events for efficient processing:

```typescript
import { BatchMiddleware } from '@your-org/analytics/middleware';

const batchMiddleware = new BatchMiddleware({
  maxSize: 10,        // Maximum batch size
  maxWait: 5000,      // Maximum wait time (ms)
  flushOnUnload: true // Flush on page unload
});
```

### Session Middleware

Adds session information to events:

```typescript
import { SessionMiddleware } from '@your-org/analytics/middleware';

const sessionMiddleware = new SessionMiddleware({
  timeout: 30 * 60 * 1000, // 30 minutes
  persistSession: true,     // Save across page loads
  trackSessionEvents: true  // Track session start/end
});
```

### Consent Middleware

Handles user privacy preferences:

```typescript
import { ConsentMiddleware } from '@your-org/analytics/middleware';

const consentMiddleware = new ConsentMiddleware({
  requiredCategories: ['analytics'],
  queueEvents: true, // Queue events until consent is given
  storageKey: 'analytics_consent'
});
```

## Creating Custom Middleware

To create custom middleware, implement the Middleware interface:

```typescript
import type { Middleware, PluginMethodData } from '@your-org/analytics';

class CustomMiddleware implements Middleware {
  name = 'custom-middleware';

  async process<M extends keyof PluginMethodData>(
    method: M,
    data: PluginMethodData[M],
    next: (data: PluginMethodData[M]) => Promise<void>
  ): Promise<void> {
    // Process the event before passing to next middleware
    const processedData = this.processData(data);
    
    // Call next middleware in chain
    await next(processedData);
  }

  private processData<T>(data: T): T {
    // Your data processing logic here
    return data;
  }
}
```

### Middleware Best Practices

1. **Error Handling**

   ```typescript
   async process(method, data, next) {
     try {
       // Process data
       await next(data);
     } catch (error) {
       console.error(`[${this.name}] Middleware error:`, error);
       // Optionally rethrow or continue chain
       throw error;
     }
   }
   ```

2. **Type Safety**

   ```typescript
   class TypedMiddleware implements Middleware {
     async process<M extends keyof PluginMethodData>(
       method: M,
       data: PluginMethodData[M],
       next: (data: PluginMethodData[M]) => Promise<void>
     ): Promise<void> {
       // TypeScript ensures type safety across the middleware chain
     }
   }
   ```

3. **Resource Cleanup**

   ```typescript
   class CleanupMiddleware implements Middleware {
     private resources: Array<() => void> = [];

     destroy(): void {
       this.resources.forEach(cleanup => cleanup());
       this.resources = [];
     }
   }
   ```

## Common Middleware Patterns

### Data Enrichment

Add additional data to events:

```typescript
class EnrichmentMiddleware implements Middleware {
  async process(method, data, next) {
    const enrichedData = {
      ...data,
      properties: {
        ...data.properties,
        environment: process.env.NODE_ENV,
        timestamp: Date.now()
      }
    };
    
    await next(enrichedData);
  }
}
```

### Data Filtering

Filter out specific events:

```typescript
class FilterMiddleware implements Middleware {
  async process(method, data, next) {
    if (this.shouldFilter(data)) {
      return; // Don't call next()
    }
    
    await next(data);
  }

  private shouldFilter(data: unknown): boolean {
    // Your filtering logic
    return false;
  }
}
```

### Data Transformation

Transform event data:

```typescript
class TransformMiddleware implements Middleware {
  async process(method, data, next) {
    const transformedData = this.transform(data);
    await next(transformedData);
  }

  private transform<T>(data: T): T {
    // Your transformation logic
    return data;
  }
}
```

## Middleware Configuration

Middleware can be added in several ways:

```typescript
// During analytics initialization
const analytics = new Analytics({
  middleware: [
    new PrivacyMiddleware(),
    new ValidationMiddleware(),
    new BatchMiddleware(),
    new CustomMiddleware()
  ]
});
```

## Middleware Order

The order of middleware matters. Consider these common patterns:

1. Privacy first (sanitize sensitive data)
2. Validation (fail fast)
3. Data enrichment/transformation
4. Consent/privacy checks
5. Batching last (before plugins)

```typescript
const analytics = new Analytics({
  middleware: [
    new PrivacyMiddleware(),     // 1. Sanitize data
    new ValidationMiddleware(),   // 2. Validate
    new EnrichmentMiddleware(),   // 3. Enrich
    new ConsentMiddleware(),      // 4. Check consent
    new BatchMiddleware()         // 5. Batch
  ]
});
```

## Testing Middleware

Example of testing custom middleware:

```typescript
import { vi, describe, it, expect } from 'vitest';
import { CustomMiddleware } from './custom-middleware';

describe('CustomMiddleware', () => {
  it('should process events', async () => {
    const middleware = new CustomMiddleware();
    const next = vi.fn();
    const event = {
      name: 'test_event',
      properties: { test: true }
    };

    await middleware.process('track', event, next);

    expect(next).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      name: 'test_event'
    }));
  });
});
```

## Next Steps

- Learn about [Plugins](./plugins.md) that receive processed events
- See [Event Tracking](./event-tracking.md) for all event types
- Check the [API Reference](./api-reference.md) for detailed documentation
