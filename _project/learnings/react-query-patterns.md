# React Query Patterns

## Hook Return Values

### Full Query Results Pattern

When creating hooks that use `useQuery`, return the full query result instead of just `{ data, error }`. This provides consumers with access to all React Query features.

```typescript
// ❌ Don't return just data and error
const useGetData = ({ enabled = true }): DataResponse<T> => {
  const { data, error } = useQuery<T, Error>({
    queryKey: ['data'],
    queryFn: fetchData,
    enabled,
  })

  return {
    data: data ?? null,
    error: error ?? null,
  }
}

// ✅ Return full query result
const useGetData = ({ enabled = true }) => {
  return useQuery<T, Error>({
    queryKey: ['data'],
    queryFn: fetchData,
    enabled,
  })
}
```

### Benefits

1. Access to all React Query features:
   - `isLoading`: Initial loading state
   - `isFetching`: Background refetch state
   - `isError`: Error state
   - `refetch`: Manual refetch function
   - `status`: Combined status string
   - And more...

2. Better loading state handling:

   ```typescript
   const { data, isLoading, isFetching } = useGetData()
   
   if (isLoading) {
     return <LoadingSpinner />
   }
   
   // Show background refresh indicator
   if (isFetching) {
     return <RefreshIndicator />
   }
   ```

3. Error handling with status:

   ```typescript
   const { data, isError, error } = useGetData()
   
   if (isError) {
     return <ErrorMessage error={error} />
   }
   ```

4. Manual refetch capabilities:

   ```typescript
   const { data, refetch } = useGetData()
   
   return (
     <button onClick={() => void refetch()}>
       Refresh Data
     </button>
   )
   ```

### Migration Guide

1. Update hook implementation:
   - Remove data/error wrapping
   - Return useQuery result directly
   - Update return type to remove custom response type

2. Update component usage:
   - Destructure needed properties from hook result
   - Add loading states using isLoading/isFetching
   - Add error handling using isError/error
   - Use refetch for manual refreshes

3. Example Migration:

```typescript
// Before
const { data, error } = useGetUserProjects()
if (error) return <div>Error: {error.message}</div>
return <ProjectList projects={data} />

// After
const { data, isLoading, isError, error } = useGetUserProjects()
if (isLoading) return <LoadingSpinner />
if (isError) return <ErrorMessage error={error} />
return <ProjectList projects={data} />
```

## Best Practices

1. Always return full query result from hooks
2. Use loading states appropriately:
   - `isLoading` for initial load
   - `isFetching` for background refreshes
3. Handle errors using `isError` and `error`
4. Provide refetch capability when needed
5. Consider using `enabled` prop for conditional fetching

## Examples

### User Projects Hook

```typescript
export const useGetUserProjects = ({
  supabase,
  enabled = true,
}) => {
  return useQuery<UserProject[], ProjectError>({
    queryKey: projectKeys.userProjects(),
    queryFn: async () => {
      const data = await getUserProjects({ supabase })
      return data
    },
    enabled,
  })
}
```

### Component Usage

```typescript
const ProjectList = () => {
  const {
    data: projects = [],
    isLoading,
    isError,
    error,
    refetch
  } = useGetUserProjects({
    supabase: supabaseClient,
  })

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (isError) {
    return (
      <ErrorMessage 
        error={error}
        onRetry={() => void refetch()}
      />
    )
  }

  return (
    <div>
      {projects.map(project => (
        <ProjectCard 
          key={project.id}
          project={project}
        />
      ))}
    </div>
  )
}
```

## Related Resources

- [TanStack Query Documentation](https://tanstack.com/query/latest/docs/react/overview)
- [React Query Patterns](https://tkdodo.eu/blog/react-query-patterns)
- [React Query Best Practices](https://tkdodo.eu/blog/react-query-best-practices)
