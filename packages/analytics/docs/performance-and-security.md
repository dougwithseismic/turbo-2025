# Performance and Security Guide

Best practices for optimizing performance and ensuring security in the Analytics Platform.

## Performance Optimization

### Batch Processing

Use the BatchMiddleware to optimize network requests:

```typescript
import { BatchMiddleware } from '@your-org/analytics/middleware';

const analytics = new Analytics({
  middleware: [
    new BatchMiddleware({
      maxSize: 10,        // Maximum events per batch
      maxWait: 5000,      // Maximum wait time (ms)
      flushOnUnload: true // Flush before page unload
    })
  ]
});
```

Configuration options:

- `maxSize`: Maximum number of events in a batch
- `maxWait`: Maximum time to wait before sending a batch
- `flushOnUnload`: Whether to flush pending events on page unload
- `maxRetries`: Number of retry attempts for failed batches

### Script Loading

The platform uses an optimized script loader:

```typescript
import { scriptLoader } from '@your-org/analytics/utils';

await scriptLoader.loadScript('https://example.com/analytics.js', {
  async: true,        // Load asynchronously
  defer: false,       // Don't defer execution
  retries: 2,         // Number of retry attempts
  retryDelay: 1000,   // Delay between retries (ms)
  cleanup: true       // Remove script after load
});
```

## Security Implementation

### Privacy Middleware

The platform includes privacy middleware for handling sensitive data:

```typescript
import { PrivacyMiddleware } from '@your-org/analytics/middleware';

const analytics = new Analytics({
  middleware: [
    new PrivacyMiddleware({
      // Additional sensitive fields to remove
      sensitiveFields: ['internal_id', 'api_key'],
      // Additional fields to hash
      hashFields: ['username', 'account_id'],
      // Custom sanitizer function
      sanitizer: (data) => {
        // Your custom sanitization logic
        return data;
      }
    })
  ]
});
```

#### Default Protected Fields

The privacy middleware automatically handles these sensitive fields:

```typescript
// Fields that are removed
const defaultSensitiveFields = [
  'password',
  'token',
  'secret',
  'creditCard',
  'ssn',
  'apiKey'
];

// Fields that are hashed
const defaultHashFields = [
  'email',
  'phone',
  'ip',
  'userId'
];
```

#### Example Usage

```typescript
// Original event
await analytics.track('login', {
  email: 'user@example.com',
  password: 'secret123',
  token: 'abc123',
  user: {
    email: 'user@example.com',
    password: 'secret123',
    profile: {
      name: 'Test User'
    }
  }
});

// Resulting sanitized event
{
  name: 'login',
  properties: {
    email_hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    user: {
      email_hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
      profile: {
        name: 'Test User'
      }
    }
  }
}
```

#### Custom Sanitization

You can implement custom sanitization rules:

```typescript
const analytics = new Analytics({
  middleware: [
    new PrivacyMiddleware({
      // Add custom fields to remove
      sensitiveFields: ['internal_id', 'api_key'],
      
      // Add custom fields to hash
      hashFields: ['username', 'account_id'],
      
      // Custom sanitizer function
      sanitizer: (data) => {
        const sanitized = { ...data };
        
        // Custom redaction
        if (sanitized.custom_field) {
          sanitized.custom_field = 'REDACTED';
        }
        
        // Custom transformation
        if (sanitized.age) {
          sanitized.age_range = getAgeRange(sanitized.age);
          delete sanitized.age;
        }
        
        return sanitized;
      }
    })
  ]
});
```

### Consent Management

Use ConsentMiddleware to handle user privacy preferences:

```typescript
const consentMiddleware = new ConsentMiddleware({
  requiredCategories: ['analytics'],
  queueEvents: true,
  storageKey: 'analytics_consent',
  defaultPreferences: {
    necessary: true,
    analytics: false,
    marketing: false
  }
});

// Update consent
consentMiddleware.updateConsent({
  analytics: true,
  marketing: false
});
```

### Session Management

Secure session handling:

```typescript
const sessionMiddleware = new SessionMiddleware({
  timeout: 30 * 60 * 1000,  // 30-minute timeout
  persistSession: true,      // Persist across page loads
  storageKey: 'analytics_session'
});
```

### Error Handling

Secure error handling:

```typescript
class SecureErrorHandler implements ErrorHandler {
  handleError(error: AnalyticsError): void {
    // Remove sensitive data from error context
    const safeContext = this.sanitizeErrorContext(error.context);
    
    // Log securely
    this.logError({
      message: error.message,
      category: error.category,
      context: safeContext,
      timestamp: error.timestamp
    });
  }
}
```

## Security Best Practices

1. **Always Use Privacy Middleware First**

   ```typescript
   const analytics = new Analytics({
     middleware: [
       new PrivacyMiddleware(),  // First to sanitize all data
       new ValidationMiddleware(),
       new ConsentMiddleware(),
       new BatchMiddleware()
     ]
   });
   ```

2. **Handle Consent**
   - Use consent middleware
   - Queue events until consent is given
   - Respect user privacy preferences

3. **Secure Data Storage**
   - Use secure storage adapters
   - Implement proper session management
   - Clean up sensitive data

4. **Error Handling**
   - Sanitize error messages and context
   - Implement proper logging
   - Handle errors securely

## Testing Security Features

### Testing Privacy Middleware

```typescript
describe('PrivacyMiddleware', () => {
  it('should remove sensitive fields', async () => {
    const middleware = new PrivacyMiddleware();
    const next = vi.fn();
    
    const event = {
      name: 'login',
      properties: {
        password: 'secret123',
        token: 'abc123',
        safe_field: 'visible'
      }
    };

    await middleware.process('track', event, next);
    
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      properties: {
        safe_field: 'visible'
      }
    }));
  });

  it('should hash PII fields', async () => {
    const middleware = new PrivacyMiddleware();
    const next = vi.fn();
    
    const event = {
      name: 'login',
      properties: {
        email: 'test@example.com',
        phone: '123-456-7890'
      }
    };

    await middleware.process('track', event, next);
    
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      properties: {
        email_hash: expect.any(String),
        phone_hash: expect.any(String)
      }
    }));
  });
});
```

### Testing Consent

```typescript
describe('Consent', () => {
  it('should respect user consent', async () => {
    const middleware = new ConsentMiddleware({
      requiredCategories: ['analytics']
    });
    
    // Without consent
    await middleware.process('track', testEvent, next);
    expect(next).not.toHaveBeenCalled();
    
    // With consent
    middleware.updateConsent({ analytics: true });
    await middleware.process('track', testEvent, next);
    expect(next).toHaveBeenCalled();
  });
});
```

## Next Steps

- Review [Error Handling](./error-handling.md)
- Check [Storage and Environment](./storage-and-environment.md)
- Learn about [Validation and Types](./validation-and-types.md)
- See [Testing Guide](./testing-guide.md)
