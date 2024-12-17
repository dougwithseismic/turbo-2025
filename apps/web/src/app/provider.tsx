'use client'

import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import * as React from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { toast } from 'react-hot-toast'
import { MainErrorFallback } from '@/components/errors/main'
import { useRef } from 'react'

type AppProviderProps = {
  children: React.ReactNode
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const queryClientRef = useRef<QueryClient>(null)

  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient({
      defaultOptions: {
        queries: {
          throwOnError: (error, query) => {
            return typeof query.state.data === 'undefined'
          },
          retry: (failureCount, error) => {
            if (error instanceof Error && error.message.includes('404')) {
              return false
            }
            return failureCount < 3
          },
          retryDelay: (attemptIndex) =>
            Math.min(1000 * 2 ** attemptIndex, 30000),
        },
      },
      queryCache: new QueryCache({
        onError: (error, query) => {
          if (typeof query.state.data !== 'undefined') {
            toast.error(
              error instanceof Error ? error.message : 'An error occurred',
            )
          }
        },
      }),
    })
  }

  return (
    <ErrorBoundary FallbackComponent={MainErrorFallback}>
      <QueryClientProvider client={queryClientRef.current}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
