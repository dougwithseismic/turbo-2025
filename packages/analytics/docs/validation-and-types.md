# Validation and Type System

The Analytics Platform uses a comprehensive validation and type system to ensure data integrity and provide excellent developer experience.

## Validation System

### Schema Definitions

The platform uses Zod for runtime validation:

```typescript
import { z } from 'zod';

// Base Properties Schema
export const basePropertiesSchema = z.object({
  timestamp: z.number().optional(),
  path: z.string().optional(),
  url: z.string().optional(),
  referrer: z.string().optional(),
  title: z.string().optional(),
  search: z.string().optional(),
}).strict();

// Button Click Properties Schema
export const buttonClickPropertiesSchema = basePropertiesSchema.extend({
  button_id: z.string(),
  button_text: z.string().optional(),
  button_type: z.enum(['submit', 'button', 'reset']).optional(),
  button_location: z.string().optional(),
}).strict();

// Form Submit Properties Schema
export const formSubmitPropertiesSchema = basePropertiesSchema.extend({
  form_id: z.string(),
  form_name: z.string().optional(),
  form_type: z.string().optional(),
  success: z.boolean(),
  error_message: z.string().optional(),
}).strict();

// Signup Properties Schema
export const signupPropertiesSchema = basePropertiesSchema.extend({
  method: z.enum(['email', 'google', 'github']),
  error_message: z.string().optional(),
}).strict();

// Login Properties Schema
export const loginPropertiesSchema = basePropertiesSchema.extend({
  method: z.enum(['email', 'google', 'github']),
  success: z.boolean(),
  error_message: z.string().optional(),
}).strict();

// Purchase Properties Schema
export const purchasePropertiesSchema = basePropertiesSchema.extend({
  product_id: z.string().optional(),
  product_name: z.string().optional(),
  price: z.number().optional(),
  currency: z.string().optional(),
  quantity: z.number().optional(),
}).strict();

// Error Properties Schema
export const errorPropertiesSchema = basePropertiesSchema.extend({
  error_message: z.string(),
  error_type: z.string().optional(),
  error_code: z.string().optional(),
  stack_trace: z.string().optional(),
}).strict();

// Session Properties Schemas
export const sessionStartPropertiesSchema = basePropertiesSchema.extend({
  session_id: z.string(),
  referrer: z.string().optional(),
  initial_path: z.string().optional(),
}).strict();

export const sessionEndPropertiesSchema = basePropertiesSchema.extend({
  session_id: z.string(),
  duration: z.number(),
  page_views: z.number(),
  events: z.number(),
}).strict();

// Custom Event Properties Schema
export const customEventPropertiesSchema = basePropertiesSchema.extend({}).catchall(z.unknown());
```

### Event Name Validation

```typescript
export const eventNameSchema = z.enum([
  'page_view',
  'button_click',
  'form_submit',
  'signup',
  'login',
  'logout',
  'purchase',
  'error',
  'session_start',
  'session_end',
  'custom'
]);
```

### Analytics Event Validation

```typescript
export const analyticsEventSchema = z.discriminatedUnion('name', [
  z.object({
    name: z.literal('button_click'),
    properties: buttonClickPropertiesSchema,
    timestamp: z.number(),
  }).strict(),
  
  z.object({
    name: z.literal('form_submit'),
    properties: formSubmitPropertiesSchema,
    timestamp: z.number(),
  }).strict(),
  
  z.object({
    name: z.literal('signup'),
    properties: signupPropertiesSchema,
    timestamp: z.number(),
  }).strict(),
  
  z.object({
    name: z.literal('login'),
    properties: loginPropertiesSchema,
    timestamp: z.number(),
  }).strict(),
  
  z.object({
    name: z.literal('purchase'),
    properties: purchasePropertiesSchema,
    timestamp: z.number(),
  }).strict(),
  
  z.object({
    name: z.literal('error'),
    properties: errorPropertiesSchema,
    timestamp: z.number(),
  }).strict(),
  
  z.object({
    name: z.literal('session_start'),
    properties: sessionStartPropertiesSchema,
    timestamp: z.number(),
  }).strict(),
  
  z.object({
    name: z.literal('session_end'),
    properties: sessionEndPropertiesSchema,
    timestamp: z.number(),
  }).strict(),
  
  z.object({
    name: z.literal('custom'),
    properties: customEventPropertiesSchema,
    timestamp: z.number(),
  }).strict(),
]);
```

## Type System

### Core Types

```typescript
// Event Names
export type EventName = z.infer<typeof eventNameSchema>;

// Base Properties
export type BaseProperties = z.infer<typeof basePropertiesSchema>;

// Event Properties
export type ButtonClickProperties = z.infer<typeof buttonClickPropertiesSchema>;
export type FormSubmitProperties = z.infer<typeof formSubmitPropertiesSchema>;
export type SignupProperties = z.infer<typeof signupPropertiesSchema>;
export type LoginProperties = z.infer<typeof loginPropertiesSchema>;
export type PurchaseProperties = z.infer<typeof purchasePropertiesSchema>;
export type ErrorProperties = z.infer<typeof errorPropertiesSchema>;
export type SessionStartProperties = z.infer<typeof sessionStartPropertiesSchema>;
export type SessionEndProperties = z.infer<typeof sessionEndPropertiesSchema>;
export type CustomEventProperties = z.infer<typeof customEventPropertiesSchema>;

// Analytics Event
export type AnalyticsEvent<T extends EventName = EventName> = {
  name: T;
  properties?: T extends keyof EventProperties
    ? EventProperties[T]
    : Record<string, unknown>;
  timestamp?: number;
};
```

### Event Type Mapping

```typescript
export type EventTypeMap = {
  page_view: BaseProperties;
  button_click: ButtonClickProperties;
  form_submit: FormSubmitProperties;
  signup: SignupProperties;
  login: LoginProperties;
  logout: BaseProperties;
  purchase: PurchaseProperties;
  error: ErrorProperties;
  session_start: SessionStartProperties;
  session_end: SessionEndProperties;
  custom: CustomEventProperties;
};

export type EventProperties = {
  [K in EventName]: K extends keyof EventTypeMap
    ? EventTypeMap[K]
    : CustomEventProperties;
};
```

## Usage Examples

### Basic Event Tracking

```typescript
// Button Click Event
analytics.track('button_click', {
  button_id: 'signup-button',
  button_text: 'Sign Up Now',
  button_type: 'submit'
});

// Form Submit Event
analytics.track('form_submit', {
  form_id: 'contact-form',
  form_name: 'Contact Us',
  success: true
});

// Purchase Event
analytics.track('purchase', {
  product_id: 'prod_123',
  product_name: 'Premium Plan',
  price: 99.99,
  currency: 'USD'
});
```

### Custom Events

```typescript
// Define custom event type
declare module '@your-org/analytics' {
  interface EventTypeMap {
    'custom_event': {
      custom_field: string;
      value: number;
    };
  }
}

// Use custom event
analytics.track('custom_event', {
  custom_field: 'test',
  value: 123
});
```

### Type Safety Examples

```typescript
// ✅ Valid event
analytics.track('button_click', {
  button_id: 'signup',
  button_text: 'Sign Up'
});

// ❌ TypeScript Error: missing required property
analytics.track('button_click', {
  button_text: 'Sign Up'
});

// ❌ TypeScript Error: invalid property type
analytics.track('button_click', {
  button_id: 123
});

// ❌ TypeScript Error: invalid event name
analytics.track('invalid_event', {
  property: 'value'
});
```

## Testing

```typescript
describe('Validation', () => {
  let analytics: Analytics;

  beforeEach(() => {
    analytics = new Analytics({
      plugins: [new ValidationPlugin()]
    });
  });

  it('should validate valid events', async () => {
    await expect(analytics.track('button_click', {
      button_id: 'test',
      button_text: 'Test'
    })).resolves.not.toThrow();
  });

  it('should reject invalid events', async () => {
    await expect(analytics.track('button_click', {
      button_text: 'Test'
    })).rejects.toThrow('Invalid event');
  });
});
```

## Next Steps

- Learn about [Testing Guide](./testing-guide.md)
- See [Performance and Security](./performance-and-security.md)
- Check [Error Handling](./error-handling.md)
- Review [Storage and Environment](./storage-and-environment.md)
