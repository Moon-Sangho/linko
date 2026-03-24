---
name: Bare domain invalid-suggestion path in useBookmarkForm
description: How to trigger the else branch in handleUrlBlur where suggestion is invalid — use strings with spaces, not plain words
type: feedback
---

In `useBookmarkForm.handleUrlBlur`, a bare string without `https?://` triggers a suggestion only when `isValidUrl('https://' + input)` is true. A plain word like `'justsomewords'` actually produces a valid URL (`https://justsomewords` passes `new URL()`), so it sets `suggestedUrl` rather than staying empty.

To test the else branch (error set, no suggestion), use a string with spaces: `'just some words'`. The URL constructor throws on space-containing hostnames, so `isValidUrl` returns false and the hook falls into the else branch.

**Why:** The initial test used `'justsomewords'` assuming it would fail URL validation, but the browser's URL constructor accepts single-segment hostnames. The failure was caught at runtime.

**How to apply:** When writing tests for the "suggestion also fails" path in handleUrlBlur, always use strings with illegal URL characters (spaces, angle brackets, etc.) rather than plain single words.
