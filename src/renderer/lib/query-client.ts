import { QueryClient } from '@tanstack/react-query';
import type { DefaultOptions } from '@tanstack/react-query';

export const queryClientDefaultOptions: DefaultOptions = {
  queries: {
    // Local SQLite — data only changes through our own mutations.
    // gcTime: Infinity keeps the cache alive as long as the app is open,
    // so re-mounting components (e.g. reopening a modal) never triggers
    // a redundant IPC call.
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    // Queries run over IPC, not HTTP — online/offline status is irrelevant.
    // Without this, TanStack Query pauses all queries when the system goes offline.
    networkMode: 'always',
    retry: 1,
  },
  mutations: {
    networkMode: 'always',
  },
};

export const queryClient = new QueryClient({
  defaultOptions: queryClientDefaultOptions,
});
