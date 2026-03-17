# Patch 003 — IPC Validation, Error Handling & Platform Detection

**Date:** 2026-03-17
**Agents involved:** Dev Core, Dev UI

## Problem

A QA sweep identified several security and reliability gaps:
- IPC handlers accepted any integer (including 0, negative) as a valid ID
- `shell.openExternal` was called without URL scheme validation — a compromised renderer
  could pass a `file://` or `javascript:` URL
- `registerIpcHandlers` had no top-level error handling; a DB init failure would
  crash silently with no user feedback
- Tag retrieval used an N+1 query pattern (one query per bookmark)
- Platform detection in renderer used `navigator.userAgent` string parsing,
  which is unreliable and Electron-specific behavior is undocumented

## Changes

- **`src/main/ipc/bookmarks.ts`**: Add `isValidId()` guard to `BOOKMARK_GET_BY_ID`,
  `BOOKMARK_UPDATE`, `BOOKMARK_DELETE`; add `isValidUrl()` check before `shell.openExternal`
- **`src/main/index.ts`**: Wrap `registerIpcHandlers` in try-catch; show
  `dialog.showErrorBox` on failure instead of silent crash
- **`src/main/db/repositories/bookmark-repository.ts`**: Add `bulkAttachTags()` helper
  to fetch all tags for a result set in one query (eliminates N+1)
- **`src/main/preload.ts`**: Expose `platform: process.platform` as static value
  via contextBridge
- **`src/renderer/env.d.ts`**: Add `platform` to `window.electron` type definition
- **`src/renderer/hooks/useKeyboardShortcuts.tsx`**: Replace `navigator.userAgent`
  check with `window.electron.platform`
- **`.claude/rules/main-conventions.md`**: Document that static process values
  (e.g. `process.platform`) may be exposed directly via contextBridge

## Security Note
`BOOKMARK_OPEN` now validates URL scheme before calling `shell.openExternal`.
Only `http:` and `https:` protocols are permitted.
