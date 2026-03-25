---
name: TanStack Query hook test patterns
description: Proven patterns and pitfalls for testing useQuery / useInfiniteQuery hooks in this project
type: feedback
---

## Query Key Verification

Do NOT write a test that only asserts `result.current.data` is defined as a proxy for "correct query key." Use `queryClient.getQueryData(expectedKey)` instead.

`createWrapper()` returns `{ wrapper, queryClient }` — use the `queryClient` to assert on cache state directly.

```typescript
// ❌ Hollow — passes even with a wrong query key
it('uses the correct query key', async () => {
  expect(result.current.data).toBeDefined()
})

// ✅ Actually verifies the key
it('caches result under the correct query key', async () => {
  const { wrapper, queryClient } = createWrapper()
  const { result } = renderHook(() => useAppVersionQuery(), { wrapper })
  await waitFor(() => expect(result.current.isSuccess).toBe(true))
  expect(queryClient.getQueryData(['app', 'version'])).toBe('1.0.0')
})
```

## Merge Data + Channel Assertions

Always assert `toHaveBeenCalledWith(IpcChannels.CHANNEL_NAME)` in the SAME test as the data assertion.
A test that only checks `result.current.data` is a pass-through — it provides no signal if the hook calls the wrong channel.

## Always Test isPending

Every query hook test file must include a test for the loading/pending state:
```typescript
it('is pending before IPC resolves', () => {
  mockInvoke.mockReturnValue(new Promise(() => {})) // never resolves
  const { wrapper } = createWrapper()
  const { result } = renderHook(() => useMyQuery(), { wrapper })
  expect(result.current.isPending).toBe(true)
})
```
No `await` needed — just check the synchronous initial state.

## Remove Pass-Through Tests

Do NOT write tests that only verify nested data structures are passed through unchanged (e.g., "returns bookmark with tags populated"). The hook does zero processing — this only tests that TanStack Query doesn't drop a nested array. Delete these.

## toHaveBeenNthCalledWith for Order-Specific Call Assertions

When asserting that a hook re-fetches with a new argument after props change, use `toHaveBeenNthCalledWith` + assert `result.current.data` reflects the new value:

```typescript
// ❌ Weak — checks entire call history, not call order
expect(mockInvoke).toHaveBeenCalledWith(IpcChannels.BOOKMARK_GET_BY_ID, 2)

// ✅ Strong — pins call position
expect(mockInvoke).toHaveBeenNthCalledWith(2, IpcChannels.BOOKMARK_GET_BY_ID, 2)
expect(result.current.data?.id).toBe(2)
```

## createWrapper Must Return { wrapper, queryClient }

The shared test utility must expose `queryClient` for cache assertions:

```typescript
export function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,   // REQUIRED — prevents background refetches from
        gcTime: Infinity,      // consuming mockResolvedValueOnce values
        refetchOnWindowFocus: false,
        networkMode: 'always',
      },
    },
  })
  const wrapper = ({ children }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  return { wrapper, queryClient }
}
```

**Why `staleTime: Infinity`**: With default `staleTime: 0`, calling `fetchNextPage()` on a stale `useInfiniteQuery` causes TanStack Query to re-fetch all existing pages first, consuming `mockResolvedValueOnce` values out of order and breaking multi-page pagination tests.

## fetchNextPage Timing Pattern

Always check `hasNextPage` synchronously BEFORE calling `fetchNextPage`. This ensures TanStack Query's `getNextPageParam` has fully run and internal state is settled:

```typescript
// ✅ Correct — settle hasNextPage first
await waitFor(() => expect(result.current.isSuccess).toBe(true))
expect(result.current.hasNextPage).toBe(true) // this is the settlement step
await act(async () => { await result.current.fetchNextPage() })
await waitFor(() => expect(result.current.data?.pages).toHaveLength(2))
```

For multi-step pagination (3+ pages), each `fetchNextPage` must be preceded by settling `hasNextPage`. When using `await act(async () => { await fetchNextPage() })` doesn't reliably flush the next page (observed in tests where the current last page has `hasMore: true`), fall back to:

```typescript
act(() => { result.current.fetchNextPage() }) // don't await act
await waitFor(() => expect(result.current.data?.pages).toHaveLength(N))
```

For resilience, pair with a fallback mock to avoid breaking on unexpected extra calls:
```typescript
mockInvoke
  .mockResolvedValueOnce(page1)
  .mockResolvedValueOnce(page2)
  .mockResolvedValueOnce(page3)
  .mockResolvedValue(emptyFallback) // absorbs any extra consistency checks
```

## useInfiniteQuery: Test hasNextPage With Offset Verification

Asserting `hasNextPage === true` only proves TanStack Query got a non-undefined value from `getNextPageParam`. A bug returning `0` instead of `BOOKMARK_PAGE_SIZE` would still pass. Always also verify the computed offset via the IPC call:

```typescript
// ✅ Verifies both the boolean AND the computed offset value
await act(async () => { await result.current.fetchNextPage() })
await waitFor(() => expect(result.current.data?.pages).toHaveLength(2))
expect(mockInvoke).toHaveBeenNthCalledWith(2, IpcChannels.BOOKMARKS_GET_PAGE, {
  limit: BOOKMARK_PAGE_SIZE,
  offset: BOOKMARK_PAGE_SIZE, // = allPages.length(1) * PAGE_SIZE
})
```

## Extract Shared Test Helpers

Place `createWrapper` and any shared pagination helpers in a `tests/test-utils.ts` file adjacent to the test files. Never copy-paste a factory function across multiple test files — divergence will happen.
