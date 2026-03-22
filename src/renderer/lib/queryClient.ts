import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Local SQLite — data only changes through our own mutations.
      // gcTime: Infinity keeps the cache alive as long as the app is open,
      // so re-mounting components (e.g. reopening a modal) never triggers
      // a redundant IPC call.
      staleTime: Infinity,
      gcTime: Infinity,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
