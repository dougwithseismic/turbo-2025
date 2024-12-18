---

# React Query Patterns

This document outlines our established patterns for using React Query in TypeScript modules.

## Core Principles

1. **Type Safety**
   - Use TypeScript for all queries and mutations
   - Define explicit types for responses and errors
   - Avoid using `any` or `unknown` without proper type guards

2. **Error Handling**
   - Create module-specific error classes
   - Provide consistent error transformation
   - Include error codes and status codes

3. **Standardization**
   - Follow RO-RO (Receive Object, Return Object) pattern
   - Use consistent naming conventions
   - Maintain predictable file structure

## Common Types

```typescript
// Base Props
type SupabaseProps = {
  supabase: SupabaseClient<Database>
}

type QueryEnabledProps = {
  enabled?: boolean
}

// Standard Response Type
type ModuleResponse<T> = {
  data: T
  error: ModuleError | null
}

// Error Class Pattern
export class ModuleError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly status?: number,
  ) {
    super(message)
    this.name = 'ModuleError'
  }

  static fromError(
    err: unknown,
    code = 'UNKNOWN_ERROR',
    status = 500,
  ): ModuleError {
    if (err instanceof Error) {
      return new ModuleError(
        err.message,
        err instanceof ModuleError ? err.code : code,
        err instanceof ModuleError ? err.status : status,
      )
    }
    return new ModuleError('An unknown error occurred', code, status)
  }
}
```

## Query Key Patterns

```typescript
// Type-safe query key definitions
type BaseKey = ['module-name']
type ListKey = [...BaseKey, 'list', { filters: Record<string, unknown> }]
type DetailKey = [...BaseKey, 'detail', string]

export const moduleKeys = {
  all: (): BaseKey => ['module-name'],
  lists: () => [...moduleKeys.all(), 'list'] as const,
  list: ({ filters }: { filters: Record<string, unknown> }): ListKey => [
    ...moduleKeys.lists(),
    { filters },
  ],
  details: () => [...moduleKeys.all(), 'detail'] as const,
  detail: ({ id }: { id: string }): DetailKey => [
    ...moduleKeys.details(),
    id,
  ],
} as const
```

## Query Options Factory

```typescript
export const moduleQueries = {
  list: ({ supabase }: SupabaseProps) =>
    queryOptions({
      queryKey: moduleKeys.list({}),
      queryFn: async (): Promise<Item[]> => {
        try {
          const data = await getItems({ supabase })
          return data
        } catch (err) {
          throw ModuleError.fromError(err, 'FETCH_ERROR')
        }
      },
    }),

  detail: ({ supabase, id }: SupabaseProps & { id: string }) =>
    queryOptions({
      queryKey: moduleKeys.detail({ id }),
      queryFn: async (): Promise<Item> => {
        try {
          const data = await getItem({ supabase, id })
          if (!data) {
            throw new ModuleError('Item not found', 'NOT_FOUND', 404)
          }
          return data
        } catch (err) {
          throw ModuleError.fromError(err, 'FETCH_ERROR')
        }
      },
    }),
}
```

## Query Hook Pattern

```typescript
export const useGetItems = ({
  supabase,
  enabled = true,
}: SupabaseProps & QueryEnabledProps): ModuleResponse<Item[]> => {
  const { data, error } = useQuery<Item[], ModuleError>({
    ...moduleQueries.list({ supabase }),
    enabled,
  })

  return {
    data: data ?? [],
    error: error ?? null,
  }
}
```

## Mutation Hook Pattern

```typescript
export const useUpdateItem = ({ supabase }: SupabaseProps) => {
  const queryClient = useQueryClient()

  return useMutation<
    Item,
    ModuleError,
    UpdateItemRequest,
    { previousData: Item | undefined }
  >({
    mutationFn: async ({ id, ...updates }) => {
      try {
        const data = await updateItem({ supabase, id, ...updates })
        if (!data) {
          throw new ModuleError('Failed to update item', 'UPDATE_FAILED')
        }
        return data
      } catch (err) {
        throw ModuleError.fromError(err, 'UPDATE_ERROR')
      }
    },
    onMutate: async ({ id, ...updates }) => {
      await queryClient.cancelQueries({
        queryKey: moduleKeys.detail({ id }),
      })
      const previousData = queryClient.getQueryData<Item>(
        moduleKeys.detail({ id }),
      )

      if (previousData) {
        const updatedData = {
          ...previousData,
          ...updates,
        }
        queryClient.setQueryData<Item>(
          moduleKeys.detail({ id }),
          updatedData,
        )
      }

      return { previousData }
    },
    onError: (err, { id }, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          moduleKeys.detail({ id }),
          context.previousData,
        )
      }
    },
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({
        queryKey: moduleKeys.detail({ id }),
      })
      void queryClient.invalidateQueries({
        queryKey: moduleKeys.lists(),
      })
    },
  })
}
```

## Best Practices

1. **Query Keys**
   - Use type-safe query key factories
   - Include necessary parameters in keys
   - Keep keys consistent across related queries

2. **Error Handling**
   - Create module-specific error classes
   - Transform unknown errors into typed errors
   - Include error codes and status codes
   - Provide helpful error messages

3. **Optimistic Updates**
   - Cancel in-flight queries before updates
   - Store previous data for rollback
   - Update all related queries on success
   - Handle errors with proper rollback

4. **Type Safety**
   - Define explicit types for all data structures
   - Use proper generics in hooks
   - Avoid type assertions when possible
   - Maintain consistent type naming

5. **Query Options**
   - Use query option factories for reusability
   - Include proper error handling
   - Handle null/undefined cases
   - Provide meaningful defaults

6. **Cache Management**
   - Invalidate related queries on mutations
   - Use optimistic updates when appropriate
   - Handle cache updates consistently
   - Consider relationships between data

7. **Documentation**
   - Include JSDoc comments for public APIs
   - Provide usage examples
   - Document error cases
   - Explain complex type relationships

## Examples

See our implemented modules for real-world examples:

- `invitations.react.ts` - Invitation management
- `organizations.react.ts` - Organization management
- `projects.react.ts` - Project management
- `profiles.react.ts` - Profile management
- `api-services.react.ts` - API service management
- `api-usage.react.ts` - API usage tracking
- `subscription-plans.react.ts` - Subscription plan management
- `subscriptions.react.ts` - Subscription management
- `payments.react.ts` - Payment management

Each module follows these patterns while adapting to their specific needs.
