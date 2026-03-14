import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Turn off retries for testing
      gcTime: 0,
    },
  },
})

export function createWrapper() {
  const testQueryClient = createTestQueryClient()
  return ({ children }) => (
    <QueryClientProvider client={testQueryClient}>
      {children}
    </QueryClientProvider>
  )
}
