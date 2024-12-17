---

## 2024-01-10 - React Query Patterns for Supabase Integration

### Category: Frontend, React Query, TypeScript

### Learning

Our standardized approach to implementing React Query with Supabase includes several key patterns:

#### 1. Error Handling Pattern

Custom error class for each module:

```typescript
export class ModuleError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly status?: number,
  ) {
    super(message)
    this.name = 'ModuleError'
  }
}
```

Error wrapping pattern:

```typescript
try {
  return await someOperation()
} catch (err) {
  if (err instanceof Error) {
    throw new ModuleError(
      err.message,
      'OPERATION_ERROR',
      err instanceof ModuleError ? err.status : 500,
    )
  }
  throw err
}
```

#### 2. Query Key Factory Pattern

Type-safe query key definitions:

```typescript
type BaseKey = ['module']
type SubResourceKey = [...BaseKey, 'subresource', string]

export const moduleKeys = {
  all: (): BaseKey => ['module'],
  subResource: ({ id }: { id: string }): SubResourceKey => [
    ...moduleKeys.all(),
    'subresource',
    id,
  ],
} as const
```

#### 3. Query Options Factory Pattern

Reusable query options with error handling:

```typescript
export const moduleQueries = {
  subResource: ({
    supabase,
    id,
  }: {
    supabase: SupabaseClient<Database>
    id: string
  }) =>
    queryOptions({
      queryKey: moduleKeys.subResource({ id }),
      queryFn: async () => {
        try {
          return await getSubResource({ supabase, id })
        } catch (err) {
          if (err instanceof Error) {
            throw new ModuleError(
              err.message,
              'FETCH_ERROR',
              err instanceof ModuleError ? err.status : 500,
            )
          }
          throw err
        }
      },
    }),
}
```

#### 4. Query Hook Pattern

Query hooks with comprehensive JSDoc examples:

```typescript
/**
 * React hook to fetch a sub-resource
 * 
 * @example
 * ```typescript
 * const SubResource = ({ id }) => {
 *   const { data, isLoading } = useGetSubResource({
 *     supabase,
 *     id,
 *   });
 *
 *   if (isLoading) return <div>Loading...</div>;
 *
 *   return <div>{data.name}</div>;
 * };
 * ```
 */
export const useGetSubResource = ({
  supabase,
  id,
  enabled = true,
}: {
  supabase: SupabaseClient<Database>
  id: string
  enabled?: boolean
}) => {
  return useQuery<SubResource, ModuleError>({
    ...moduleQueries.subResource({ supabase, id }),
    enabled,
  })
}
```

#### 5. Mutation Hook Pattern

Mutation hooks with cache invalidation:

```typescript
export const useUpdateSubResource = ({
  supabase,
}: {
  supabase: SupabaseClient<Database>
}) => {
  const queryClient = useQueryClient()

  return useMutation<string, ModuleError, UpdateRequest>({
    mutationFn: async ({ id, data }) => {
      try {
        return await updateSubResource({ supabase, id, data })
      } catch (err) {
        if (err instanceof Error) {
          throw new ModuleError(
            err.message,
            'UPDATE_ERROR',
            err instanceof ModuleError ? err.status : 500,
          )
        }
        throw err
      }
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: moduleKeys.subResource({ id }),
      })
    },
  })
}
```

### Context

- Each module follows this exact pattern structure
- Error handling is consistent across all modules
- Query keys are strongly typed and hierarchical
- All hooks include comprehensive JSDoc examples
- Cache invalidation is handled at the mutation level

### Benefits

- Consistent error handling across the application
- Type safety throughout the query layer
- Reusable query options and keys
- Self-documenting code with examples
- Predictable cache invalidation
- Easy to maintain and extend
- Follows RO-RO (Request Object-Response Object) pattern

### Related Resources

- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Supabase TypeScript Support](https://supabase.com/docs/reference/typescript-support)
