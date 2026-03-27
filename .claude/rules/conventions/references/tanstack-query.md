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
    all: ['bookmarks'] as const,                                           // internal prefix only
    lists: () => [...queryKeys.bookmark.all, 'list'] as const,            // broad list invalidation
    list: (input: BookmarkListInput) => [...queryKeys.bookmark.lists(), input] as const,
    byIds: () => [...queryKeys.bookmark.all, 'by-id'] as const,           // broad byId invalidation
    byId: (id: number) => [...queryKeys.bookmark.byIds(), id] as const,
  },
  app: {
    all: ['app'] as const,                                                 // internal prefix only
    version: () => [...queryKeys.app.all, 'version'] as const,
  },
} as const
```

Rules:
- Every domain has an `all` base key — **internal use only** (see rule below)
- Derived keys always spread the parent key (`[...queryKeys.app.all, 'version']`)
- Parameterized keys are functions; parameter-free derived keys are also functions for consistency
- Add an intermediate prefix key (e.g. `lists`, `byIds`) when a group of parameterized keys needs broad invalidation

---

## `all` Key Usage Rule

**`queryKeys.*.all` must never be used as a `queryKey` in `useQuery` or `useInfiniteQuery`.**

`all` is a domain namespace prefix — its primary purpose is to be spread into derived keys.
It is also allowed in `invalidateQueries` and `removeQueries` for broad domain-level cache operations,
because `invalidateQueries` uses prefix matching (`exact: false`) by default.

```typescript
// ❌ Bad — all is not a fetchable queryKey
useQuery({ queryKey: queryKeys.bookmark.all, queryFn: ... });

// ✅ Good — use a specific derived key for fetching
useQuery({ queryKey: queryKeys.bookmark.byId(id), queryFn: ... });

// ✅ Good — broad domain invalidation after a mutation
queryClient.invalidateQueries({ queryKey: queryKeys.bookmark.all });
// This invalidates all ['bookmarks', ...] queries: list(), byId(), etc.

// ✅ Good — full domain cache eviction (e.g. logout)
queryClient.removeQueries({ queryKey: queryKeys.bookmark.all });
```

---

## Query Hook Structure

One hook file per query, placed in `src/renderer/hooks/queries/`.

```typescript
// ✅ src/renderer/hooks/queries/use-bookmark-query.ts
import { useQuery } from '@tanstack/react-query'
import { IpcChannels } from '@shared/ipc-channels'
import type { Bookmark } from '@shared/types'
import { queryKeys } from '@renderer/lib/query-keys'

export function useBookmarkQuery(id: number) {
  return useQuery({
    queryKey: queryKeys.bookmark.byId(id),
    queryFn: () => window.electron.invoke(IpcChannels.BOOKMARK_GET_BY_ID, id) as Promise<Bookmark | null>,
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

---

## Mutation Usage in Components

Always destructure mutation hooks at the call site — never use the mutation object directly.

```typescript
// ✅ Destructure
const { mutate: deleteTag, isPending: isDeleting } = useDeleteTagMutation()
const { mutateAsync: createBookmark } = useCreateBookmarkMutation()

// ❌ Use object directly
const deleteMutation = useDeleteTagMutation()
deleteMutation.mutate(id)
deleteMutation.isPending
```
