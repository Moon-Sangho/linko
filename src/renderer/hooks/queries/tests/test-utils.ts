import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { queryClientDefaultOptions } from '@renderer/lib/query-client'

/**
 * Creates a fresh QueryClient + wrapper for each test.
 * Returns both so tests can inspect the cache directly (e.g. to verify query keys).
 *
 * Inherits production defaultOptions from query-client.ts (staleTime, gcTime, etc.)
 * with retry disabled — keeps test behavior aligned with production without duplication.
 *
 * Usage:
 *   const { wrapper, queryClient } = createWrapper()
 *   const { result } = renderHook(() => useMyQuery(), { wrapper })
 *   expect(queryClient.getQueryData(['my', 'key'])).toBe(expected)
 */
export function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      ...queryClientDefaultOptions,
      queries: {
        ...queryClientDefaultOptions.queries,
        retry: false,
      },
    },
  })
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  return { wrapper, queryClient }
}
