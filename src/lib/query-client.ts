import { QueryClient } from "@tanstack/react-query";

/**
 * Global TanStack Query client.
 * Configured with sensible defaults for a SaaS dashboard:
 * - staleTime: 30s (avoid refetching on every focus)
 * - retry: 1 (fast failure for mock environment)
 * - gcTime: 5 min (keep cache reasonably fresh)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
