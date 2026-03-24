---
name: useBookmarkForm runBlurChecks does not short-circuit on success:false
description: When BOOKMARK_CHECK_DUPLICATE returns { success: false }, the hook still proceeds to the metadata fetch — always mock both IPC calls
type: feedback
---

In `useBookmarkForm.runBlurChecks`, `setIsDuplicate(dupResult.success && dupResult.data === true)` does not return early when `success` is false. Execution continues into the metadata fetch block whenever the title is empty.

Tests that only mock the duplicate-check IPC call and expect no further IPC calls will crash with `TypeError: Cannot read properties of undefined` when the hook tries to access `.success` on the `undefined` metadata result.

**Why:** Discovered when writing a test for `{ success: false }` dup check result — a second `mockResolvedValueOnce` for the metadata call was required even though `isDuplicate` was the only assertion target.

**How to apply:** Always provide two `mockResolvedValueOnce` calls for any `handleUrlBlur` test that reaches a valid URL, even when only asserting on dup-check behavior. Exception: use `setupBlurMocks()` helper which already sets up both.
