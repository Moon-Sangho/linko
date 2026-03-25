# TanStack Query Conventions

Rules for all data fetching with `@tanstack/react-query` in `src/renderer/`.

---

## Global QueryClient Defaults

`src/renderer/lib/query-client.ts` sets the following defaults for all queries:

| Option | Value | Reason |
|--------|-------|--------|
| `staleTime` | `Infinity` | Local SQLite data only changes through our own mutations |
| `gcTime` | `Infinity` | Re-mounting components never triggers redundant IPC calls |
| `refetchOnWindowFocus` | `false` | Desktop app — window focus has no data-freshness meaning |
| `networkMode` | `'always'` | IPC, not HTTP — online/offline status is irrelevant |
| `retry` | `1` | One retry on failure |

**Do not override these defaults per-query unless there is a specific reason.**
Adding `staleTime` or `gcTime` to individual `useQuery` calls is redundant and misleading.

```typescript
// ❌ Bad — redundant, already set globally
export function useAppVersionQuery() {
  return useQuery({
    queryKey: queryKeys.app.version(),
    queryFn: () => window.electron.invoke(IpcChannels.APP_GET_VERSION) as Promise<string>,
    staleTime: Infinity,
  })
}

// ✅ Good — rely on global defaults
export function useAppVersionQuery() {
  return useQuery({
    queryKey: queryKeys.app.version(),
    queryFn: () => window.electron.invoke(IpcChannels.APP_GET_VERSION) as Promise<string>,
  })
}
```

---

## Query Key Structure

Query keys live in `src/renderer/lib/query-keys.ts`.
Use a hierarchical structure with an `all` base key per domain:

```typescript
export const queryKeys = {
  bookmark: {
    all: ['bookmarks'] as const,
    search: (input: SearchBookmarksInput) => ['bookmarks', 'search', input] as const,
  },
  app: {
    all: ['app'] as const,
    version: () => [...queryKeys.app.all, 'version'] as const,
  },
} as const
```

Rules:
- Every domain has an `all` base key for broad invalidation
- Derived keys spread the parent (`[...queryKeys.app.all, 'version']`)
- Parameterized keys are functions; parameter-free derived keys are also functions for consistency

---

## Query Hook Structure

One hook file per query, placed in `src/renderer/hooks/queries/`.

```typescript
// ✅ src/renderer/hooks/queries/use-bookmarks-query.ts
import { useQuery } from '@tanstack/react-query'
import { IpcChannels } from '@shared/ipc-channels'
import type { Bookmark } from '@shared/types'
import { queryKeys } from '@renderer/lib/query-keys'

export function useBookmarksQuery() {
  return useQuery({
    queryKey: queryKeys.bookmark.all,
    queryFn: () => window.electron.invoke(IpcChannels.BOOKMARKS_GET_ALL) as Promise<Bookmark[]>,
  })
}
```

---

## queryFn Pattern

The `queryFn` should be a single expression that calls `window.electron.invoke` and casts the return type — matching the IPC read response shape (data returned directly, no wrapper).

```typescript
// ✅ Simple cast — read handlers return data directly
queryFn: () => window.electron.invoke(IpcChannels.BOOKMARKS_GET_ALL) as Promise<Bookmark[]>

// ❌ Avoid async/await + IpcResult unwrapping in queryFn
// This means the IPC handler is incorrectly using a mutation response shape for a read.
// Fix the handler instead (see main.md — IPC Response Shape).
queryFn: async () => {
  const result = await window.electron.invoke(...) as IpcResult<string>
  if (result.success && result.data) return result.data
  return null
}
```
