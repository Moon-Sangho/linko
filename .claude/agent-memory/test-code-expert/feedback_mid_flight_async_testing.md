---
name: Mid-flight async state testing pattern
description: How to safely test isFetchingMeta / in-flight state in useBookmarkForm without unawaited-act + waitFor conflicts
type: feedback
---

Do NOT combine `waitFor` from `@testing-library/react` with a non-awaited `blurAct = act(async () => ...)`. These two interact poorly and cause "not configured to support act()" warnings and cascade failures where `result.current` becomes null in subsequent tests.

Instead, use `await act(async () => { await Promise.resolve() })` to flush microtasks between the dup-check resolution and the metadata-fetch start, then synchronously assert or mutate state:

```typescript
const blurAct = act(async () => {
  await result.current.handleUrlBlur()
})

// Flush microtasks so dup check resolves and metadata fetch starts (isFetchingMeta goes true)
await act(async () => {
  await Promise.resolve()
})

// Now safe to call reset/cancel and assert isFetchingMeta is false
act(() => result.current.reset())
expect(result.current.isFetchingMeta).toBe(false)

// Then resolve stale response and drain
resolveMeta(...)
await blurAct
```

**Why:** `waitFor` polls using real timers and creates its own async context, which collides with the open non-awaited `act`. The `Promise.resolve()` flush is sufficient because `mockResolvedValueOnce` schedules resolution as a microtask — one flush tick is enough.

**How to apply:** Any test in `use-bookmark-form.test.ts` (or similar) that needs to observe intermediate async state (e.g., isFetchingMeta is true mid-flight) before resetting or cancelling.
