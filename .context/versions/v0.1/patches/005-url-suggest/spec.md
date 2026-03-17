# Patch 005 — URL Input: "Did you mean?" Suggestion for Bare Domains

**Date:** 2026-03-17
**Agents involved:** Dev UI

## Problem

When a user typed `naver.com` or `www.naver.com` (no protocol) into the URL field
and blurred the input, the app silently prepended `https://` without any feedback
(Option A — auto-normalization).

This was identified as a UX issue: the user had no awareness of the correction,
and the behavior was inconsistent with how URL inputs typically work.

## Decision: Option B — Smart Error + "Did you mean?" Suggestion

Show an inline error and a clickable suggestion instead of auto-correcting silently.

```
┌─────────────────────────────────────┐
│ naver.com                           │
└─────────────────────────────────────┘
  ⚠ URL must start with https:// or http://
    Did you mean: https://naver.com?   ← clickable
```

Clicking the suggestion:
1. Applies the normalized URL to the field
2. Immediately runs duplicate check and metadata fetch

## Changes

### `src/renderer/hooks/useBookmarkForm.ts`
- `handleUrlBlur`: Detect bare domain (no protocol), set `urlError` + `suggestedUrl`
- `runBlurChecks()`: Extract duplicate check + meta fetch into reusable helper
- `applySuggestion(skipDupCheckForUrl?)`: Apply suggestion, clear error, run checks
- `handleUrlChange` / `reset` / `prefill`: Clear `suggestedUrl` on change/reset

### `src/renderer/components/bookmark/AddBookmarkModal.tsx`
- Render "Did you mean: `<button>`?" below URL input when `suggestedUrl` is set
- `applySuggestion()` called with no args (no existing URL to skip)

### `src/renderer/components/bookmark/EditBookmarkModal.tsx`
- Same "Did you mean?" UI
- `applySuggestion(bookmark.url)` — passes original URL so dup check is skipped
  when the suggestion matches the current bookmark's URL

### `src/main/ipc/bookmarks.ts`
- `BOOKMARK_CREATE` / `BOOKMARK_UPDATE`: Validate URL as-is; reject bare domains with `{ success: false }`

### Title re-fetch on URL change

**Problem:** When a user changed the URL after an auto-fetched title had already filled in,
the title was not re-fetched because `runBlurChecks` only ran metadata fetch when `!title`.
The old auto-filled title would silently persist for the new URL.

**Fix:** Track whether the title was auto-filled vs manually typed via `titleAutoFilledRef`.

- `titleAutoFilledRef = true` when title is set by metadata fetch
- `titleAutoFilledRef = false` when user manually edits the title field
- `runBlurChecks`: condition changed from `!title` → `!title || titleAutoFilledRef.current`
- `handleTitleChange()` added: wraps `setTitle`, resets `titleAutoFilledRef.current = false`
- `reset()` / `prefill()`: reset `titleAutoFilledRef.current = false`

### Title placeholder

- Changed from `'Page title'` → `'Auto-filled from URL'` (both Add and Edit modals)
- Communicates to the user that leaving the field blank is intentional
- `'Fetching title…'` still shown while metadata fetch is in progress

## Bare Domain Detection Logic

| Input | Behaviour |
|-------|-----------|
| `naver.com` | Error + suggest `https://naver.com` |
| `www.naver.com` | Error + suggest `https://www.naver.com` |
| `192.168.0.1` | Error + suggest `http://192.168.0.1` (IP defaults to http) |
| `https://naver.com` | Pass through (no error) |
| `http://naver.com` | Pass through (no error) |
| `ftp://naver.com` | Error only, no suggestion |
| `javascript:alert(1)` | Error only, no suggestion |
