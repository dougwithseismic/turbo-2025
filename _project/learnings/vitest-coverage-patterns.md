# Vitest Coverage Patterns

---

## 2024-12-29 - Vitest Coverage Setup and Type-Safe Analytics

### Category: Testing, Analytics, TypeScript

### Learning

Setting up consistent test coverage across a monorepo with proper type safety:

1. Vitest Coverage Configuration:

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'node', // or 'jsdom' for web apps
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'src/test/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/types/*',
        'dist/**',
      ],
    },
  },
})
```

1. Type-Safe Analytics Implementation:

```typescript
// Strongly typed event data
interface FormEvent extends BaseEvent {
  form_id: string
  form_name: string
  success: boolean
  error?: string
  metadata?: Record<string, unknown>
}

// Hooks with proper type inference
const trackFormSubmit = useCallback((event: FormEvent) => {
  const eventData = {
    event_type: 'form_submit',
    form_id: event.form_id,
    form_name: event.form_name,
    success: event.success,
    timestamp: event.timestamp ?? Date.now(),
    ...(event.error && { error_message: event.error }),
    ...(event.metadata && event.metadata),
  }
  void analytics.track('form_submit', eventData)
}, [])
```

### Context

- Coverage setup needs to be consistent across all apps in a monorepo
- Each app may require different test environments (node vs jsdom)
- Analytics events need strict typing to prevent runtime errors
- Avoid type assertions and use proper type inference

### Benefits

1. Coverage Configuration:

- Consistent coverage reporting across all apps
- Multiple report formats for different use cases
- Proper exclusion patterns to avoid irrelevant files
- Environment-specific configuration for accurate testing

1. Type-Safe Analytics:

- Compile-time error detection for analytics events
- Autocomplete support for event properties
- Prevents runtime errors from incorrect event data
- Better maintainability and refactoring support

### Related Resources

- [Vitest Coverage Documentation](https://vitest.dev/guide/coverage.html)
- [TypeScript Handbook - Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
