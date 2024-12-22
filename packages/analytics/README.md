# @repo/analytics

A flexible, type-safe analytics implementation with support for multiple providers and advanced features.

## Features

- 🔌 Plugin-based architecture
- 📊 Type-safe event tracking
- 🌐 Multiple analytics providers
- 🔄 Automatic retry with exponential backoff
- 📦 Event batching
- 🍪 GDPR-compliant consent management
- 📝 Session tracking
- ✨ Event validation
- 🚀 Async event queue

## Installation

```bash
pnpm add @repo/analytics
```

## Basic Usage

```typescript
import {
  Analytics,
  GoogleAnalytics4Plugin,
  createValidationMiddleware,
  createBatchMiddleware,
  createConsentMiddleware,
  createSessionMiddleware,
} from '@repo/analytics';

// Create middleware instances
const validationMiddleware = createValidationMiddleware({ strict: true });
const batchMiddleware = createBatchMiddleware({ maxSize: 10, maxWait: 5000 });
const consentMiddleware = createConsentMiddleware({
  requiredCategories: ['analytics'],
});
const sessionMiddleware = createSessionMiddleware({
  timeout: 30 * 60 * 1000, // 30 minutes
  persistSession: true,
});

// Create analytics instance with plugins and middleware
const analytics = new Analytics({
  plugins: [
    new GoogleAnalytics4Plugin({
      measurementId: 'G-XXXXXXXXXX',
    }),
  ],
  // Middleware is executed in order
  middleware: [
    validationMiddleware,  // Validates events first
    consentMiddleware,     // Then checks consent
    batchMiddleware,       // Then batches events
    sessionMiddleware,     // Finally adds session data
  ],
});

// Track events
analytics.track('button_click', {
  button_id: 'signup',
  button_location: 'header',
});

// Track page views
analytics.page({
  path: '/products',
  title: 'Products',
});

// Identify users
analytics.identify('user123', {
  email: 'user@example.com',
  plan: 'premium',
});
```

## Core Concepts

### Middleware Architecture

The analytics package uses a middleware architecture to process events before they reach plugins. Middleware can:

- Validate events
- Batch events
- Manage user consent
- Track sessions
- And more...

Each middleware has access to the event data and can:

- Modify the event data
- Block events (e.g., when consent is not given)
- Queue events (e.g., for batching)
- Add metadata (e.g., session information)

The middleware chain is executed in the order specified in the middleware array, allowing for predictable event processing:

```typescript
const analytics = new Analytics({
  plugins: [
    new GoogleAnalytics4Plugin({
      measurementId: 'G-XXXXXXXXXX',
    }),
  ],
  middleware: [
    validationMiddleware,  // 1. Validate events
    consentMiddleware,     // 2. Check consent
    batchMiddleware,       // 3. Batch events
    sessionMiddleware,     // 4. Add session data
  ],
});
```

### Event Tracking

The analytics package provides three main methods for tracking:

1. **track(name, properties)**: Track specific events with custom properties
2. **page(pageView)**: Track page views with path and title
3. **identify(userId, traits)**: Associate user data with subsequent events

All tracking methods automatically include:

- Timestamp
- Session information (when using session middleware)
- User consent status (when using consent middleware)

### Sessions: Understanding User Engagement

Sessions are crucial for understanding how users interact with your application over time. Here's why you might want to use sessions and how they help:

#### When to Use Sessions

1. **E-commerce Applications**

   ```typescript
   // Bad: Tracking purchases without session context
   analytics.track('purchase', {
     product_id: 'xyz',
     price: 99.99
   });

   // Good: Tracking with session context shows the full purchase journey
   // Session automatically adds:
   // - How many products were viewed
   // - Time spent browsing
   // - Previous pages visited
   analytics.track('purchase', {
     product_id: 'xyz',
     price: 99.99
   });
   ```

2. **Content Platforms**

   ```typescript
   // Bad: Can't distinguish between casual and engaged readers
   analytics.track('article_read', {
     article_id: '123',
     category: 'technology'
   });

   // Good: Session data reveals reading patterns
   // Automatically tracks:
   // - Number of articles read per session
   // - Average reading time
   // - Content category preferences
   analytics.track('article_read', {
     article_id: '123',
     category: 'technology'
   });
   ```

3. **SaaS Applications**

   ```typescript
   // Bad: Individual feature usage without context
   analytics.track('feature_used', {
     feature_name: 'export_data'
   });

   // Good: Session data shows feature adoption patterns
   // Automatically includes:
   // - Features used per session
   // - Feature usage sequence
   // - Time spent per feature
   analytics.track('feature_used', {
     feature_name: 'export_data'
   });
   ```

Sessions help you:

1. **Track User Journey**
   - Follow a user's path through your application
   - Understand how long users stay engaged
   - Identify where users drop off
   - Analyze user behavior patterns

2. **Measure Engagement Quality**
   - Track the number of events per session
   - Monitor page views within each session
   - Calculate average session duration
   - Identify high-value vs low-value sessions

3. **Improve Analytics Accuracy**
   - Group related events together
   - Distinguish between different user visits
   - Prevent data fragmentation
   - Maintain context across events

The session middleware automatically:

- Generates unique session IDs
- Tracks session duration and activity
- Handles session timeouts and renewals
- Persists sessions across page reloads (optional)

```typescript
// Option 1: Independent sessions per plugin
const analytics = new Analytics({
  plugins: [
    withSession(
      new GoogleAnalytics4Plugin({
        measurementId: 'G-XXXXXXXXXX',
      }),
      {
        timeout: 30 * 60 * 1000, // 30 minutes
        persistSession: true,
        trackSessionEvents: true, // Tracks session_start and session_end events
      }
    ),
  ],
});

// Option 2: Shared session store across plugins
const sessionStore = createSessionStore({
  timeout: 30 * 60 * 1000, // 30 minutes
  persistSession: true,
});

const analytics = new Analytics({
  plugins: [
    withSession(
      new GoogleAnalytics4Plugin({ measurementId: 'G-XXXXXXXXXX' }),
      { store: sessionStore }
    ),
    withSession(
      new MixpanelPlugin({ token: 'YOUR_TOKEN' }),
      { store: sessionStore }
    )
  ]
});
```

The session store pattern provides several benefits:

- Consistent session tracking across analytics providers
- Flexible per-plugin configuration while sharing core session state
- Clean separation of session management from plugin logic
- Easy addition/removal of plugins from shared session groups
- Efficient resource usage through centralized session state

Session data enriches all events with:

- session_id
- session_page_views
- session_events
- session_duration

### Event Batching: Optimizing Analytics Performance

Event batching is a crucial optimization technique that significantly improves both performance and reliability. Here's when and why you should use batching:

#### When to Use Batching

1. **High-Frequency Events**

   ```typescript
   // Bad: Sending every scroll event individually
   // Problems:
   // - Excessive network requests
   // - High server load
   // - Poor mobile performance
   window.addEventListener('scroll', () => {
     analytics.track('page_scrolled', {
       scroll_depth: getScrollDepth()
     });
   });

   // Good: Batching automatically groups scroll events
   // Benefits:
   // - Reduces network requests (e.g., 100 events → 1 request)
   // - Improves mobile battery life
   // - Prevents rate limiting
   window.addEventListener('scroll', () => {
     analytics.track('page_scrolled', {
       scroll_depth: getScrollDepth()
     });
   });
   ```

2. **Form Analytics**

   ```typescript
   // Bad: Individual requests for each field change
   // Problems:
   // - High network overhead
   // - Risk of data loss on submit
   // - No event ordering
   form.addEventListener('change', (e) => {
     analytics.track('form_field_changed', {
       field: e.target.name,
       value: e.target.value
     });
   });

   // Good: Batching groups field changes efficiently
   // Benefits:
   // - Single network request for multiple changes
   // - Maintains field change sequence
   // - Better form completion analysis
   form.addEventListener('change', (e) => {
     analytics.track('form_field_changed', {
       field: e.target.name,
       value: e.target.value
     });
   });
   ```

3. **Real-time Features**

   ```typescript
   // Bad: Individual events for chat messages
   // Problems:
   // - Server overload during active chats
   // - Network congestion
   // - Potential message loss
   chatRoom.on('message', (msg) => {
     analytics.track('message_sent', {
       room_id: msg.roomId,
       length: msg.content.length
     });
   });

   // Good: Batching optimizes message analytics
   // Benefits:
   // - Efficient handling of message bursts
   // - Reduced server costs
   // - Better chat metrics
   chatRoom.on('message', (msg) => {
     analytics.track('message_sent', {
       room_id: msg.roomId,
       length: msg.content.length
     });
   });
   ```

4. **Mobile/Offline Support**

   ```typescript
   // Bad: No handling of poor connectivity
   // Problems:
   // - Data loss during offline periods
   // - Battery drain from retry attempts
   // - Poor user experience
   function logUserActivity(action) {
     analytics.track(action.type, action.data);
   }

   // Good: Batching handles offline scenarios
   // Benefits:
   // - Queues events when offline
   // - Smart retry with backoff
   // - Preserves event order
   function logUserActivity(action) {
     analytics.track(action.type, action.data);
   }
   ```

Batching provides these key benefits:

1. **Network Optimization**
   - Reduces HTTP requests by grouping multiple events together
   - Minimizes bandwidth usage and server load
   - Improves mobile device performance and battery life
   - Reduces analytics impact on application performance

2. **Reliability Improvements**
   - Handles network failures gracefully with automatic retries
   - Prevents data loss during page unload
   - Maintains event order within batches
   - Provides built-in error recovery

3. **Resource Efficiency**
   - Reduces browser CPU usage through fewer API calls
   - Optimizes memory consumption with smart batch management
   - Minimizes background processing overhead
   - Improves overall application responsiveness

The batching middleware provides intelligent event handling through configurable options:

```typescript
// Create batch middleware with configuration
const batchMiddleware = createBatchMiddleware({
  // Core batching configuration
  maxSize: 10,        // Send batch when 10 events are collected
  maxWait: 5000,      // Or when 5 seconds have passed
  flushOnUnload: true, // Send remaining events before page closes

  // Retry configuration for reliability
  maxRetries: 3,      // Retry failed batches up to 3 times
  backoffFactor: 2,   // Double delay between retry attempts
  initialDelay: 1000, // Start with 1 second delay
  maxDelay: 30000,    // Never wait more than 30 seconds

  // Debug support
  debug: true,        // Enable detailed logging
});

// Use the middleware with analytics
const analytics = new Analytics({
  plugins: [
    new GoogleAnalytics4Plugin({
      measurementId: 'G-XXXXXXXXXX',
    }),
  ],
  middleware: [batchMiddleware],
});
```

Key batching features:

1. **Smart Collection**
   - Automatically collects events until batch criteria are met
   - Maintains chronological order of events
   - Handles different event types appropriately
   - Optimizes batch size for network conditions

2. **Intelligent Delivery**
   - Sends batches based on size or time thresholds
   - Ensures timely data delivery while minimizing requests
   - Handles page unload scenarios gracefully
   - Preserves event order during delivery

3. **Error Resilience**
   - Implements exponential backoff for retries
   - Persists failed events for later retry
   - Provides detailed error reporting
   - Prevents duplicate event submission

4. **Performance Monitoring**
   - Tracks batch success and failure rates
   - Measures batch processing times
   - Reports network-related issues
   - Helps optimize batch configuration

Batching features:

- Automatic flushing when batch size is reached
- Time-based flushing
- Retry support for failed batches
- Unload handling to prevent data loss

## Advanced Usage

### Middleware Composition

Features can be added through middleware composition:

```typescript
// Create middleware instances
const validationMiddleware = createValidationMiddleware({
  strict: true,
});

const consentMiddleware = createConsentMiddleware({
  requiredCategories: ['analytics'],
});

const batchMiddleware = createBatchMiddleware({
  maxSize: 10,
  maxWait: 5000,
});

const sessionMiddleware = createSessionMiddleware({
  timeout: 30 * 60 * 1000,
  persistSession: true,
});

// Use middleware in desired order
const analytics = new Analytics({
  plugins: [
    new GoogleAnalytics4Plugin({
      measurementId: 'G-XXXXXXXXXX',
    }),
  ],
  middleware: [
    validationMiddleware,  // Validate events first
    consentMiddleware,     // Then check consent
    batchMiddleware,       // Then batch events
    sessionMiddleware,     // Finally add session data
  ],
});
```

The order of middleware matters:

1. Validation runs first to ensure events are valid before processing
2. Consent checks if the event should be processed
3. Batching collects valid, consented events
4. Session tracking adds user session data to events

### Extending Analytics

The analytics package can be extended in two ways: through plugins and middleware.

#### Creating Custom Plugins

Plugins handle the actual sending of events to analytics services. They must implement the Plugin interface:

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

// Example custom plugin
class CustomAnalyticsPlugin implements Plugin {
  name = 'custom-analytics';

  async initialize(): Promise<void> {
    // Set up your analytics service
    // Load external scripts, initialize SDK, etc.
  }

  async track<T extends EventName>(event: AnalyticsEvent<T>): Promise<void> {
    // Send event to your analytics service
    console.log('Tracking:', event.name, event.properties);
  }

  async page(pageView: PageView): Promise<void> {
    // Track page view
    console.log('Page View:', pageView.path, pageView.title);
  }

  async identify(identity: Identity): Promise<void> {
    // Associate user data
    console.log('User:', identity.userId, identity.traits);
  }

  loaded(): boolean {
    return true;
  }

  async destroy(): Promise<void> {
    // Clean up resources
  }
}
```

#### Creating Custom Middleware

Middleware processes events before they reach plugins. They must implement the Middleware interface:

```typescript
interface Middleware {
  name: string;
  process: <T extends keyof PluginMethodData>(
    method: T,
    data: PluginMethodData[T],
    next: (data: PluginMethodData[T]) => Promise<void>,
  ) => Promise<void>;
}

// Example custom middleware
class CustomMiddleware implements Middleware {
  name = 'custom-middleware';

  async process<T extends keyof PluginMethodData>(
    method: T,
    data: PluginMethodData[T],
    next: (data: PluginMethodData[T]) => Promise<void>,
  ): Promise<void> {
    try {
      // Pre-process the event
      console.log(`Processing ${method} event:`, data);

      // Modify data if needed
      const enrichedData = {
        ...data,
        properties: {
          ...data.properties,
          custom_field: 'custom value',
        },
      };

      // Continue the middleware chain with modified data
      await next(enrichedData);

      // Optional: Post-process after other middleware and plugins
      console.log(`Completed processing ${method} event`);
    } catch (error) {
      console.error(`Error in custom middleware: ${error}`);
      // Continue the chain even if there's an error
      await next(data);
    }
  }
}

// Use both custom plugin and middleware
const analytics = new Analytics({
  plugins: [new CustomAnalyticsPlugin()],
  middleware: [new CustomMiddleware()],
});
```

### Type Safety

The package provides full TypeScript support:

```typescript
// Define your event types
interface EventProperties {
  button_click: {
    button_id: string;
    button_location?: string;
    button_text?: string;
  };
  form_submit: {
    form_id: string;
    form_data: Record<string, unknown>;
  };
}

// Events are now type-safe
analytics.track('button_click', {
  button_id: 'signup',     // Required
  button_location: 'header', // Optional
  invalid_prop: true,      // Error: not in type definition
});
```

### Best Practices

1. **Event Naming**:
   - Use snake_case for event names
   - Be consistent with naming conventions
   - Use descriptive names (e.g., 'button_click' vs 'click')

2. **Properties**:
   - Include contextual data that helps analyze the event
   - Use consistent property names across similar events
   - Avoid sensitive information (PII, passwords, etc.)

3. **Session Handling**:
   - Configure appropriate session timeouts for your use case
   - Consider persisting sessions for better user journey tracking
   - Track session events to analyze user engagement

4. **Batching Configuration**:
   - Balance batch size vs latency requirements
   - Enable flushOnUnload to prevent data loss
   - Configure appropriate retry logic for failed batches

5. **Error Handling**:
   - Use validation middleware to catch issues early
   - Implement retry logic for network failures
   - Monitor failed events in production

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Run tests
pnpm test

# Format code
pnpm format

# Lint code
pnpm lint
```

## License

MIT
