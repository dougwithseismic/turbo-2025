# Getting Started

## Installation

Install the analytics package using your preferred package manager:

```bash
npm install @withseismic/analytics
# or
yarn add @withseismic/analytics
# or
pnpm add @withseismic/analytics
```

## Basic Usage

Here's a simple example of how to initialize and use the analytics platform:

```typescript
import { Analytics } from '@withseismic/analytics';
import { GoogleTagManagerPlugin } from '@withseismic/analytics/plugins';

// Create an analytics instance with plugins
const analytics = new Analytics({
  plugins: [
    new GoogleTagManagerPlugin({ containerId: 'GTM-XXXXX' })
  ],
  debug: true // Enable debug logging
});

// Initialize analytics
await analytics.initialize();

// Track a page view
await analytics.page({
  path: '/home',
  title: 'Home Page'
});

// Track a custom event
await analytics.track('button_click', {
  button_id: 'signup-button',
  button_text: 'Sign Up Now'
});

// Identify a user
await analytics.identify('user123', {
  email: 'user@example.com',
  plan: 'premium'
});
```

## Configuration Options

When creating a new Analytics instance, you can provide various configuration options:

```typescript
const analytics = new Analytics({
  // Array of analytics plugins to use
  plugins: [/* ... */],
  
  // Enable debug mode for detailed logging
  debug: true,
  
  // Custom error handler
  errorHandler: {
    handleError(error) {
      // Custom error handling logic
    }
  }
});
```

## Adding Plugins

Plugins allow you to send analytics data to different providers. Here's how to add plugins:

```typescript
// Add a plugin during initialization
const analytics = new Analytics({
  plugins: [
    new GoogleTagManagerPlugin({ containerId: 'GTM-XXXXX' }),
    new ConsolePlugin() // Useful for development
  ]
});

// Or add a plugin after initialization
analytics.use(new DebugPlugin());
```

## Using Middleware

Middleware can transform or validate your analytics data before it reaches the plugins:

```typescript
import { ValidationMiddleware, BatchMiddleware } from '@withseismic/analytics/middleware';

const analytics = new Analytics({
  plugins: [/* ... */],
  middleware: [
    // Validate events before sending
    new ValidationMiddleware(),
    
    // Batch events for better performance
    new BatchMiddleware({
      maxSize: 10,
      maxWait: 5000
    })
  ]
});
```

## Type Safety

The analytics platform is built with TypeScript and provides type definitions for events and their properties:

```typescript
// Events are typed with their expected properties
analytics.track('button_click', {
  button_id: 'signup',     // Required
  button_text: 'Sign Up',  // Optional
  button_type: 'submit'    // Optional, must be 'submit', 'button', or 'reset'
});

// TypeScript will catch invalid event names or properties
analytics.track('invalid_event', {  // Error: Invalid event name
  invalid_prop: true               // Error: Unknown property
});
```

## Next Steps

- Learn about [Core Concepts](./core-concepts.md)
- Explore available [Plugins](./plugins.md)
- Understand [Middleware](./middleware.md)
- See [Event Tracking](./event-tracking.md) for all event types
- Check the [API Reference](./api-reference.md) for detailed documentation
