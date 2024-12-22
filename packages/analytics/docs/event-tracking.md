# Event Tracking

The Analytics Platform provides structured event tracking with built-in event types and support for custom events.

## Event Types

### Page Views

Track when users view pages:

```typescript
await analytics.page({
  path: '/products',
  title: 'Products Page',
  referrer: 'https://google.com',
  search: '?category=electronics'
});
```

Properties:

- `path` (required): Current page path
- `title` (required): Page title
- `referrer` (optional): Referring URL
- `search` (optional): Search query parameters
- `properties` (optional): Additional custom properties

### Button Clicks

Track button interactions:

```typescript
await analytics.track('button_click', {
  button_id: 'signup-button',
  button_text: 'Sign Up Now',
  button_type: 'submit',
  button_location: 'header'
});
```

Properties:

- `button_id` (required): Unique identifier for the button
- `button_text` (optional): Button's display text
- `button_type` (optional): Type of button ('submit', 'button', 'reset')
- `button_location` (optional): Location of button in the UI

### Form Submissions

Track form submissions:

```typescript
await analytics.track('form_submit', {
  form_id: 'contact-form',
  form_name: 'Contact Us',
  form_type: 'contact',
  success: true,
  error_message: undefined
});
```

Properties:

- `form_id` (required): Unique identifier for the form
- `form_name` (optional): Display name of the form
- `form_type` (optional): Type of form
- `success` (required): Whether submission was successful
- `error_message` (optional): Error message if submission failed

### User Signup

Track user signups:

```typescript
await analytics.track('signup', {
  method: 'email',
  error_message: undefined
});
```

Properties:

- `method` (required): Signup method ('email', 'google', 'github')
- `error_message` (optional): Error message if signup failed

### User Login

Track user logins:

```typescript
await analytics.track('login', {
  method: 'email',
  success: true,
  error_message: undefined
});
```

Properties:

- `method` (required): Login method ('email', 'google', 'github')
- `success` (required): Whether login was successful
- `error_message` (optional): Error message if login failed

### Purchases

Track purchases:

```typescript
await analytics.track('purchase', {
  product_id: 'prod_123',
  product_name: 'Premium Plan',
  price: 99.99,
  currency: 'USD',
  quantity: 1
});
```

Properties:

- `product_id` (optional): Product identifier
- `product_name` (optional): Product name
- `price` (optional): Price of product
- `currency` (optional): Currency code
- `quantity` (optional): Quantity purchased

### Errors

Track error events:

```typescript
await analytics.track('error', {
  error_message: 'Failed to load data',
  error_type: 'ApiError',
  error_code: 'ERR_001',
  stack_trace: error.stack
});
```

Properties:

- `error_message` (required): Error message
- `error_type` (optional): Type of error
- `error_code` (optional): Error code
- `stack_trace` (optional): Stack trace

### Session Events

Track session lifecycle:

```typescript
// Session Start
await analytics.track('session_start', {
  session_id: 'sess_123',
  referrer: 'https://google.com',
  initial_path: '/landing'
});

// Session End
await analytics.track('session_end', {
  session_id: 'sess_123',
  duration: 300000,
  page_views: 5,
  events: 12
});
```

### User Identity

Track user identification:

```typescript
await analytics.identify('user_123', {
  email: 'user@example.com',
  name: 'John Doe',
  plan: 'premium',
  signupDate: '2024-01-01',
  lastLogin: new Date().toISOString()
});
```

Properties:

- `userId` (required): Unique user identifier
- `traits` (optional): User properties/traits

## Base Properties

All events include these base properties:

```typescript
interface BaseProperties {
  timestamp?: number;    // Event timestamp
  path?: string;        // Current page path
  url?: string;         // Full URL
  referrer?: string;    // Referring URL
  title?: string;       // Page title
  search?: string;      // Search query parameters
}
```

## Custom Events

Track custom events with your own properties:

```typescript
await analytics.track('custom_event', {
  custom_property: 'value',
  nested: {
    property: 'value'
  },
  array: [1, 2, 3]
});
```

## Type Safety

The platform provides TypeScript types for all events:

```typescript
import type { 
  EventName, 
  EventProperties, 
  ButtonClickProperties 
} from '@withseismic/analytics';

// TypeScript will ensure properties match the event type
const properties: ButtonClickProperties = {
  button_id: 'signup',
  button_text: 'Sign Up'
};

await analytics.track('button_click', properties);
```

## Validation

Events are automatically validated against their schemas:

```typescript
// This will throw a validation error
await analytics.track('button_click', {
  // Error: missing required button_id
  button_text: 'Click Me'
});
```

## Best Practices

1. **Consistent Naming**
   - Use snake_case for event names and properties
   - Be descriptive but concise
   - Follow a naming convention across your application

2. **Property Values**
   - Use appropriate data types
   - Keep string lengths reasonable
   - Avoid sensitive information
   - Include relevant context

3. **Error Handling**

   ```typescript
   try {
     await analytics.track('custom_event', properties);
   } catch (error) {
     console.error('Failed to track event:', error);
     // Handle or report error
   }
   ```

4. **Batch Processing**
   - Use BatchMiddleware for high-volume events
   - Configure appropriate batch size and timing
   - Ensure critical events are sent immediately

## Next Steps

- Learn about [Plugins](./plugins.md) that process events
- Understand [Middleware](./middleware.md) for event processing
- Check the [API Reference](./api-reference.md) for detailed documentation
