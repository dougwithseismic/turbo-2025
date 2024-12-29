# Server Page React Query Pattern

This pattern demonstrates how to properly set up React Query in a Next.js server component page with data prefetching and hydration.

## Key Components

1. **QueryClient Initialization**

   ```typescript
   const queryClient = new QueryClient()
   ```

2. **Data Fetching & Prefetching**

   ```typescript
   // Fetch data
   const data = await getData()
   
   // Prefetch for client
   await queryClient.prefetchQuery(
     queryKeys.detail({ params }),
   )
   ```

3. **Hydration Boundary**

   ```typescript
   return (
     <HydrationBoundary state={dehydrate(queryClient)}>
       <ClientComponent />
     </HydrationBoundary>
   )
   ```

## Benefits

- Prevents waterfall requests
- Ensures data consistency between server and client
- Enables client-side caching and revalidation
- Prevents hydration mismatches

## Example Implementation

```typescript
export default async function ServerPage({
  params,
}: PageProps) {
  // Initialize query client
  const queryClient = new QueryClient()
  
  // Get data dependencies
  const supabase = await createSupabaseServerClient()
  
  // Fetch initial data
  const data = await getData({ supabase, ...params })
  
  // Handle missing data
  if (!data) {
    redirect('/fallback-route')
  }
  
  // Prefetch for client hydration
  await queryClient.prefetchQuery(
    dataQueries.detail({ supabase, ...params }),
  )
  
  // Return hydrated component
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ClientComponent />
    </HydrationBoundary>
  )
}
```

## Important Notes

- Always initialize a new `QueryClient` for each request
- Use `prefetchQuery` to populate the cache before hydration
- Wrap client components in `HydrationBoundary`
- Dehydrate the query client state for client handoff
