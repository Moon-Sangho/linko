# Test Code Review Report

Date: 2026-03-24
Files reviewed: 7
Verdict: FAIL

---

## Executive Summary

| Reviewer | Issues |
|----------|--------|
| Skeptic (false confidence) | 10 |
| Coverage Hawk (missing scenarios) | 33 |
| Pragmatist (maintainability) | 6 |
| **Total** | **49** |

### Top Priorities

Consensus issues (flagged by 2+ reviewers — fix these first):

1. **`bookmark-item.test.tsx` — positional `buttons[0]` selector** *(Skeptic + Pragmatist)*
   `screen.getAllByRole('button')[0]` silently clicks the wrong element if any button is added before the checkbox. Fix: add `aria-label="Select bookmark"` to the checkbox and use `getByRole('button', { name: /select/i })`.

2. **`use-bookmark-form.test.ts` — stale metadata fetch race condition untested** *(Skeptic + Coverage Hawk)*
   The race condition test only covers the duplicate-check response being discarded after reset. The metadata fetch stale-response path is unguarded and untested — a missing session guard here would not be caught.

3. **`use-bookmark-form.test.ts` — `cancel()` function entirely untested** *(Skeptic + Coverage Hawk)*
   The hook exposes `cancel()` but it is never exercised. In-flight fetch + cancel → stale result should be discarded; this is a core contract of the hook.

4. **`use-bookmark-form.test.ts` — `isFetchingMeta` loading flag** *(Skeptic + Coverage Hawk)*
   Skeptic: the reset test asserts `isFetchingMeta === false` without ever setting it to true — a trivially passing assertion. Coverage Hawk: no test verifies the flag transitions to `true` mid-flight and back to `false` on completion.

5. **`use-search-bookmark.test.ts` — tag-only debounce path untested** *(Skeptic + Coverage Hawk)*
   No test changes only `selectedTagIds` (with empty `searchQuery`) and verifies the debounce fires. The effect depends on `[searchQuery, selectedTagIds]` but only the combined path is tested.

6. **`use-search-bookmark.test.ts` — fragile call-count arithmetic** *(Skeptic + Pragmatist)*
   `initialCallCount + 1` assertion couples the test to React render scheduling. The content assertion on the same line is sufficient — the count check adds noise without confidence.

---

## Skeptic Findings

### src/renderer/components/bookmark/tests/bookmark-item.test.tsx

**[SKEPTIC] HIGH — Overlay assertion only checks call count, not what is passed**
Test: "opens the edit modal when the edit button is clicked"
`expect(mockOverlayOpen).toHaveBeenCalledTimes(1)` passes even if called with `null` or the wrong `bookmarkId`. Fix: assert the factory argument renders an `EditBookmarkModal` with the correct `bookmarkId`.

**[SKEPTIC] MEDIUM — `buttons[0]` positional selector**
Test: "calls onCheckToggle with the bookmark id when the checkbox is clicked"
DOM-order-dependent. Any layout change silently breaks intent. (See consensus issue #1.)

**[SKEPTIC] HIGH — `greaterThanOrEqual(1)` title-fallback assertion is too weak**
Test: "falls back to URL when title is null"
The URL `<span>` is always rendered — the assertion passes even if the title-fallback logic is removed entirely. Fix: query the specific title element and assert its text content is the URL.

**[SKEPTIC] LOW — Delete error test could be timing-sensitive**
Test: "shows an error message when delete fails"
The `mockRejectedValueOnce` rejection resolves asynchronously. In practice `userEvent` wraps in `act`, but a `waitFor` would make the intent explicit.

### src/renderer/hooks/tests/use-bookmark-form.test.ts

**[SKEPTIC] LOW — Auto-fill test does not verify data flows from mock**
Test: "auto-fills title from metadata when title is empty"
The mock returns `'Fetched Title'` and the assertion checks for `'Fetched Title'`. If the hook set a hardcoded string, it would also pass. Fix: use a distinctive value and verify it appears in `result.current.title`.

**[SKEPTIC] MEDIUM — `isFetchingMeta` reset assertion is trivially true**
Test: "clears url, title, selectedTagIds, isDuplicate, and suggestedUrl"
`isFetchingMeta` was never set to `true` before `reset()` is called. Fix: start a blur with a pending mock to force it to `true` first.

**[SKEPTIC] MEDIUM — `skipDupCheckForUrl` test only asserts the negative**
Test: "skips duplicate check when URL matches skipDupCheckForUrl"
No assertion that `isDuplicate` remains `false` or `suggestedUrl` stays empty. If `reset()` is skipped but the state leaks, this test would not catch it.

**[SKEPTIC] HIGH — Race condition test does not cover metadata fetch stale path**
Test: "does not set isDuplicate when response arrives after reset"
Only the duplicate-check IPC call is held. The metadata fetch path is uncontrolled and the stale guard is not verified for it. (See consensus issue #2.)

### src/renderer/hooks/tests/use-search-bookmark.test.ts

**[SKEPTIC] LOW — `searchResults` passthrough test is minimal**
Test: "returns data from useSearchQuery as searchResults"
Only confirms the destructuring alias is correct. Acceptable but minimal.

**[SKEPTIC] LOW — Debounce call-count arithmetic is fragile**
Test: "does not update the query key before the debounce delay"
(See consensus issue #6.)

**[SKEPTIC] LOW — In-`act` timer/setState interleaving is subtle**
Test: "resets the debounce timer when query changes before the delay"
`vi.advanceTimersByTime(500)` and `setSearchQuery('react')` are inside the same `act()` block. Execution order is non-deterministic; this could be a latent flakiness source.

### src/renderer/store/tests/use-ui-store.test.ts

**[SKEPTIC] LOW — `only allows one tag at a time` test partially overlaps with prior test**
Tests "replaces the selected tag" and "only allows one tag at a time" exercise the same two-toggle scenario without adding a materially different path.

### src/shared/utils/tests/is-valid-url.test.ts

**[SKEPTIC] LOW — `https://`-only test exercises the try/catch path, not the protocol-filter path**
The assertion is correct, but the value is testing Node/browser runtime behavior (URL constructor throws) rather than application logic. Not a blocker.

---

## Coverage Hawk Findings

### src/renderer/components/bookmark/tests/bookmark-item.test.tsx

- `isSelected={true}` visual state not tested (different background class applied)
- `isChecked={true}` check icon not tested
- `deleting` spinner (`'…'`, disabled buttons) during in-flight delete not tested
- Double-click on checkbox `stopPropagation` not tested
- `tags: []` empty list: tag section should be absent — not tested
- Favicon with non-null `favicon_url` not tested
- Action buttons' `stopPropagation` — clicking open/edit/delete should not call `onClick` — not tested
- Keyboard interactions (e.g., Escape to dismiss delete confirmation) not tested

### src/renderer/hooks/tests/use-bookmark-form.test.ts

- `BOOKMARK_CHECK_DUPLICATE` returning `{ success: false }` — `isDuplicate` stays `false` — not tested
- `BOOKMARK_FETCH_METADATA` returning `{ success: false }` — `isFetchingMeta` clears, title unchanged — not tested
- `window.electron.invoke` rejecting outright — hook stays stable — not tested
- `isFetchingMeta` transition (true during fetch → false after) not tested (see consensus #4)
- `cancel()` function entirely untested (see consensus #3)
- `handleUrlBlur` with whitespace-only URL (early return, no IPC) not tested
- `canSave` with `'   '` (whitespace only) not tested
- `handleUrlBlur` on a bare invalid string where suggestion also fails — validation error path not tested
- `formState.errors.url.message` not asserted after blur with bare domain
- Stale metadata fetch after reset not tested (see consensus #2)
- `prefill` does not verify `notes` field is restored

### src/renderer/hooks/tests/use-search-bookmark.test.ts

- Tag-only search (empty `searchQuery`, non-empty `selectedTagIds`) not tested (see consensus #5)
- Tag change alone triggering and resetting debounce not tested
- Error object without `.message` property → `error` is `null` not tested
- Unmount with pending debounce timer — no cleanup/no-op behavior not tested

### src/renderer/store/tests/use-ui-store.test.ts

- `setSearchQuery('   ')` stores whitespace as-is (no trimming) — not documented by test
- `toggleTag(0)` boundary behavior not tested
- `clearTags` does not affect `searchQuery` — not tested

### src/renderer/utils/tests/debounce.test.ts

- `delay: 0` boundary not tested
- No-argument call — `fn` receives zero args (not `[undefined]`) — not tested
- No `cancel`/`flush` API — absence is undocumented (low priority)

### src/shared/utils/tests/is-valid-id.test.ts

- `Number.MAX_SAFE_INTEGER + 1` boundary not tested
- `{}` object input not tested
- `true` / `false` boolean inputs not tested

### src/shared/utils/tests/is-valid-url.test.ts

- `'   '` whitespace-only string not tested
- `'https://user:pass@example.com'` credential-bearing URL not documented
- `'//example.com'` protocol-relative URL not tested
- Unicode/IDN domain (`'https://例え.jp'`) not tested
- `null` / `undefined` passed as string — runtime edge — not tested

---

## Pragmatist Findings

### src/renderer/components/bookmark/tests/bookmark-item.test.tsx

**[PRAGMATIST] Fragile positional selector**
`buttons[0]` for checkbox — (see consensus #1). Add `aria-label="Select bookmark"` to the source component.

**[PRAGMATIST] Magic locale-sensitive date string**
`'Jan 15, 2024'` — fails in non-`en-US` locales. Fix: assert the date element's presence by label/role rather than rendered text, or lock locale in test setup.

**[PRAGMATIST] `beforeEach` declared outside `describe`**
Breaks locality — reader must scan outside the describe block to understand setup. Move inside `describe('BookmarkItem', ...)`.

### src/renderer/hooks/tests/use-bookmark-form.test.ts

**[PRAGMATIST] `mockInvoke` uses bare `vi.fn()` instead of `vi.hoisted()`**
Inconsistent with project convention in `testing.md`. Fix:
```typescript
const { mockInvoke } = vi.hoisted(() => ({ mockInvoke: vi.fn() }))
```

**[PRAGMATIST] Repeated two-`mockResolvedValueOnce` IPC setup**
`{ success: true, data: false }` + `{ success: true, data: { title: null, ... } }` copy-pasted 3+ times. Fix: extract `setupBlurMocks({ isDup = false, title = null } = {})` helper.

**[PRAGMATIST] `beforeEach` outside `describe` — same locality issue as bookmark-item**
Move `mockInvoke.mockReset()` inside the top-level describe block.

### src/renderer/hooks/tests/use-search-bookmark.test.ts

**[PRAGMATIST] Repeated last-call extraction pattern (×5)**
`mockUseSearchQuery.mock.calls[mockUseSearchQuery.mock.calls.length - 1][0]` copy-pasted 5 times. Fix:
```typescript
const lastQueryInput = () =>
  mockUseSearchQuery.mock.calls[mockUseSearchQuery.mock.calls.length - 1][0] as SearchBookmarksInput
```

**[PRAGMATIST] Hardcoded debounce delay `1000`**
Magic number repeated throughout tests — breaks silently if `DEBOUNCE_MS` constant changes. Fix: export `DEBOUNCE_MS` from the hook and import it in the test.

**[PRAGMATIST] Fragile call-count assertion `initialCallCount + 1`**
(see consensus #6) — drop it.

---

## Consensus Issues

Issues flagged by 2 or more reviewers — highest confidence, fix first:

| File | Issue | Flagged By |
|------|-------|------------|
| `bookmark-item.test.tsx` | `buttons[0]` positional selector — breaks on DOM order change | Skeptic + Pragmatist |
| `use-bookmark-form.test.ts` | Stale metadata fetch race condition path not tested | Skeptic + Coverage Hawk |
| `use-bookmark-form.test.ts` | `cancel()` function entirely untested | Skeptic + Coverage Hawk |
| `use-bookmark-form.test.ts` | `isFetchingMeta` trivially-passing reset assertion + no mid-flight test | Skeptic + Coverage Hawk |
| `use-search-bookmark.test.ts` | Tag-only debounce path not tested | Skeptic + Coverage Hawk |
| `use-search-bookmark.test.ts` | Fragile call-count arithmetic on line 125 | Skeptic + Pragmatist |
