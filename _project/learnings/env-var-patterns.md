# Environment Variable Patterns

## Type-Safe Environment Configuration

### Core Pattern

```typescript
// env.schema.ts - Single source of truth
const envSchema = {
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']),

  // Client-side variables (public)
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
    // ... other client variables
  },

  // Server-side variables (protected)
  server: {
    PORT: z.coerce.number(),
    // ... other server variables
  },
}
```

### Benefits

1. **Type Safety**
   - Runtime validation with Zod
   - TypeScript type inference
   - Compile-time checks
   - Proper coercion

2. **Developer Experience**
   - Clear separation of concerns
   - Comprehensive validation
   - Better error messages
   - Easy to extend

3. **Security**
   - Protected server variables
   - Public client variables
   - Clear boundaries
   - Runtime validation

## Implementation Guide

### 1. Schema Definition

```typescript
// env.schema.ts
import { z } from 'zod'

export const envSchema = {
  NODE_ENV: z.enum(['development', 'production', 'test']),
  
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEXT_PUBLIC_ANALYTICS_ID: z.string().optional(),
  },
  
  server: {
    PORT: z.coerce.number().default(3000),
    API_KEY: z.string().min(1),
  },
}
```

### 2. Client Configuration

```typescript
// env.client.ts
import { createEnv } from "@t3-oss/env-nextjs"
import { envSchema } from "./env.schema"

export const env = createEnv({
  client: envSchema.client,
  runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_ANALYTICS_ID: process.env.NEXT_PUBLIC_ANALYTICS_ID,
  },
})

// Type-safe config object
export const clientConfig = {
  APP_URL: env.NEXT_PUBLIC_APP_URL,
  ANALYTICS_ID: env.NEXT_PUBLIC_ANALYTICS_ID,
} as const
```

### 3. Server Configuration

```typescript
// env.server.ts
import { createEnv } from "@t3-oss/env-nextjs"
import { envSchema } from "./env.schema"

export const env = createEnv({
  server: {
    ...envSchema.server,
    NODE_ENV: envSchema.NODE_ENV,
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    API_KEY: process.env.API_KEY,
  },
})

// Type-safe config object
export const serverConfig = {
  PORT: env.PORT,
  API_KEY: env.API_KEY,
} as const
```

## Best Practices

1. **Schema Organization**
   - Single source of truth
   - Clear separation of client/server
   - Proper validation rules
   - Sensible defaults

2. **Type Safety**
   - Use Zod for validation
   - Leverage type inference
   - Avoid manual type definitions
   - Use const assertions

3. **Security**
   - Never expose server variables to client
   - Validate all variables at runtime
   - Use proper naming conventions
   - Document security implications

4. **Documentation**
   - Clear examples
   - Security notes
   - Usage patterns
   - Common pitfalls

## Common Patterns

### 1. Default Values

```typescript
const schema = {
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production']).default('development'),
}
```

### 2. Optional Variables

```typescript
const schema = {
  ANALYTICS_ID: z.string().optional(),
  DEBUG: z.coerce.boolean().default(false),
}
```

### 3. Computed Values

```typescript
const config = {
  IS_PRODUCTION: env.NODE_ENV === 'production',
  API_URL: `${env.BASE_URL}/api`,
} as const
```

### 4. Validation Rules

```typescript
const schema = {
  PORT: z.coerce.number().min(1).max(65535),
  API_KEY: z.string().min(32).max(64),
}
```

## Testing

### 1. Schema Validation

```typescript
describe('Environment Configuration', () => {
  it('should validate correct variables', () => {
    const result = schema.safeParse({
      PORT: '3000',
      API_KEY: 'valid-key',
    })
    expect(result.success).toBe(true)
  })
})
```

### 2. Error Cases

```typescript
it('should fail on invalid variables', () => {
  const result = schema.safeParse({
    PORT: 'invalid',
    API_KEY: '',
  })
  expect(result.success).toBe(false)
})
```

## Common Pitfalls

1. **Type Inference**
   - Don't manually define types
   - Use Zod's type inference
   - Let TypeScript work for you
   - Avoid type assertions

2. **Security**
   - Never expose server variables
   - Validate all input
   - Use proper prefixes
   - Document security requirements

3. **Testing**
   - Test validation rules
   - Test default values
   - Test error cases
   - Test type coercion

## Migration Guide

1. **Preparation**
   - Audit existing variables
   - Document requirements
   - Plan validation rules
   - Create test cases

2. **Implementation**
   - Create schema
   - Add validation
   - Update usage
   - Run tests

3. **Validation**
   - Test all cases
   - Check security
   - Verify types
   - Document changes

## Resources

- [Zod Documentation](https://zod.dev)
- [T3 Env](https://env.t3.gg)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
