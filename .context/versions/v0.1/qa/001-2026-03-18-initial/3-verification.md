# QA Verification Report

Generated: 2026-03-18
Overall: WARN (improved from FAIL)

## Summary

| Category | Previous | Result | Fixed | Remaining |
|----------|----------|--------|-------|-----------|
| Security | WARN | PASS | 2/3 | 1 |
| IPC | WARN | WARN | 0/3 | 3 |
| Functional | WARN | WARN | 0/2 | 2 |
| Build | WARN | WARN | 2/2 + 1 new | 1 |
| Architecture | FAIL | WARN | 13/17 | 4 |

**Total: 17 issues fixed, 11 remain (all WARN/LOW severity)**

## Remaining Issues

| Severity | Category | File | Description |
|----------|----------|------|-------------|
| WARN | IPC | src/main/ipc/bookmarks.ts | Read handlers (`bookmarks:get-all`, `bookmarks:search`, `bookmark:get-by-id`) wrap results in `IpcResult<T>` — reads should return data directly |
| WARN | IPC | src/main/ipc/tags.ts | `tags:get-all` read handler wraps result in `IpcResult<T>` |
| WARN | IPC | src/main/ipc/bookmarks.ts | `bookmark:get-by-id` handler has no renderer call site — unused |
| WARN | IPC | src/main/ipc/file-system.ts | `fs:export-bookmarks` handler has no renderer call site — export feature unimplemented in UI |
| WARN | Architecture | src/renderer/components/bookmark/EditBookmarkModal.tsx | 285 lines — exceeds ~150-line limit |
| WARN | Architecture | src/renderer/components/bookmark/AddBookmarkModal.tsx | 226 lines — exceeds ~150-line limit |
| WARN | Architecture | src/renderer/components/bookmark/BookmarkItem.tsx | 185 lines — slightly exceeds ~150-line limit |
| LOW | Security | src/main/ipc/file-system.ts | `FS_EXPORT_BOOKMARKS`: `Array.isArray` check added but individual element shapes not validated before `JSON.stringify` |
| LOW | Build | package.json | `"main": "out/main/index.js"` diverges from `dist/` convention in build agent spec — internally consistent but spec misaligned |
| LOW | Functional | src/renderer/hooks/useSearch.ts | Search logic calls IPC directly from hook rather than through `useBookmarkStore` action — functionally correct, architecturally inconsistent |
| LOW | Functional | src/renderer/components/layout/Sidebar.tsx | Import flow calls IPC directly from component, bypassing store layer — data refreshes correctly via `fetchAll()` after success |

---

## Security

### Result: PASS (improved from WARN)

### Fix Verification

| # | Severity | Issue | Status | Evidence |
|---|----------|-------|--------|----------|
| 1 | LOW | `BOOKMARK_FETCH_METADATA`: `url` passed without `isValidUrl()` | **FIXED** | `bookmarks.ts:108` — `isValidUrl(url)` guard added |
| 2 | LOW | `TAG_DELETE`: `id` not validated before `repo.delete(id)` | **FIXED** | `tags.ts:36` — `isValidId(id)` guard added |
| 3 | LOW | `FS_EXPORT_BOOKMARKS`: `bookmarks` array not shape-validated | **PARTIALLY FIXED** | `file-system.ts:34` — `Array.isArray` check added; per-element shape not validated |

### Checklist
- [x] `contextIsolation: true` — `src/main/index.ts:57`
- [x] `nodeIntegration: false` — `src/main/index.ts:58`
- [x] `sandbox: true` — `src/main/index.ts:59`
- [x] Preload script used for all IPC bridging
- [x] No `remote` module usage
- [x] No direct `ipcRenderer` exposed via contextBridge
- [x] No `webSecurity: false`
- [x] IPC handlers validate input before use

### Remaining Issues

| Severity | File | Description |
|----------|------|-------------|
| LOW | src/main/ipc/file-system.ts:48 | `FS_EXPORT_BOOKMARKS`: array presence checked but element shapes not validated — arbitrary renderer-supplied objects written to disk as-is |

### Notes
- `BOOKMARK_CHECK_DUPLICATE` (`bookmarks.ts:117`) passes `url` to `repo.isDuplicate()` without `isValidUrl()` — not in previous report, worth noting for next cycle.

---

## IPC

### Result: WARN (unchanged)

### Fix Verification

| # | Severity | Issue | Status |
|---|----------|-------|--------|
| 1 | WARN | `bookmark:get-by-id` — no renderer call site | **STILL PRESENT** |
| 2 | WARN | `fs:export-bookmarks` — no renderer call site | **STILL PRESENT** |
| 3 | WARN | Read handlers wrap in `IpcResult<T>` | **STILL PRESENT** |

### Channel Coverage

| Channel | Handler | Caller | Shape OK |
|---------|---------|--------|----------|
| `bookmarks:get-all` | bookmarks.ts:15 | useBookmarkStore.ts:25 | WARN — wraps in `IpcResult<T>` |
| `bookmarks:search` | bookmarks.ts:26 | useSearch.ts:31 | WARN — wraps in `IpcResult<T>` |
| `bookmark:get-by-id` | bookmarks.ts:37 | ❌ no call site | N/A |
| `bookmark:create` | bookmarks.ts:49 | useBookmarkStore.ts:40 | ✅ |
| `bookmark:update` | bookmarks.ts:63 | useBookmarkStore.ts:55 | ✅ |
| `bookmark:delete` | bookmarks.ts:78 | useBookmarkStore.ts:78 | ✅ |
| `bookmark:open` | bookmarks.ts:91 | useBookmarkStore.ts:95 | ✅ |
| `bookmark:fetch-metadata` | bookmarks.ts:104 | useBookmarkForm.ts:79 | ✅ |
| `bookmark:check-duplicate` | bookmarks.ts:117 | useBookmarkForm.ts:67 | ✅ |
| `tags:get-all` | tags.ts:7 | useTagStore.ts:22 | WARN — wraps in `IpcResult<T>` |
| `tag:create` | tags.ts:18 | useTagStore.ts:37 | ✅ |
| `tag:delete` | tags.ts:32 | useTagStore.ts:52 | ✅ |
| `fs:import-bookmarks` | file-system.ts:9 | Sidebar.tsx:23 | ✅ |
| `fs:export-bookmarks` | file-system.ts:31 | ❌ no call site | N/A |
| `window:minimize` | window.ts:6 | TitleBar.tsx:10 | ✅ |
| `window:maximize` | window.ts:11 | TitleBar.tsx:11 | ✅ |
| `window:close` | window.ts:19 | TitleBar.tsx:12 | ✅ |
| `app:get-version` | app.ts:6 | TitleBar.tsx:16 | ✅ |

### Notes
- `IpcResult<T>` wrapping on reads is a breaking API change — both handler and all store callers must be updated simultaneously.
- `fs:export-bookmarks` main handler is fully implemented; only the UI trigger (button/menu item) is missing.

---

## Functional

### Result: WARN (unchanged)

### Fix Verification

| # | Severity | Issue | Status |
|---|----------|-------|--------|
| 1 | LOW | Search logic in `useSearch` hook not `useBookmarkStore` | **STILL PRESENT** — `useSearch.ts:31` |
| 2 | LOW | `Sidebar` calls IPC directly, bypassing store | **STILL PRESENT** — `Sidebar.tsx:23` |

### Flow Trace

| Flow | Status |
|------|--------|
| Add bookmark | PASS |
| Edit bookmark | PASS |
| Delete bookmark | PASS |
| Search | WARN — `useSearch` calls IPC directly |
| Tag filter | PASS |
| Import from browser HTML | WARN — `Sidebar` calls IPC directly |
| App quit | PASS |

### Notes
- Both deviations are functionally correct end-to-end — data refreshes correctly and search is debounced with stale-request guarding.
- These are intentional design choices, not regressions; may be accepted as-is for v0.1.

---

## Build

### Result: WARN (unchanged, but issues resolved)

### Fix Verification

| # | Severity | Issue | Status | Evidence |
|---|----------|-------|--------|----------|
| 1 | MEDIUM | Windows `nsis` target not defined | **FIXED** | `package.json:67–69` — `"win": { "target": ["nsis"] }` |
| 2 | LOW | `@main` alias not configured | **FIXED** | `electron.vite.config.ts:8–11` — `mainAlias` applied to both `main` and `preload` configs |

### Remaining Issues

| Severity | File | Description |
|----------|------|-------------|
| LOW | package.json | `"main": "out/main/index.js"` diverges from `dist/` convention in build agent spec — internally consistent, does not block builds |

### Notes
- `electron-builder` config inline in `package.json` is valid — no `electron-builder.yml` needed.
- All required runtime dependencies present.

---

## Architecture

### Result: WARN (improved from FAIL)

### Fix Verification

| # | Severity | Issue | Status |
|---|----------|-------|--------|
| 1 | HIGH | `src/renderer/components/bookmark/index.ts` barrel | **FIXED** — file deleted |
| 2 | HIGH | `src/renderer/components/ui/index.ts` barrel | **FIXED** — file deleted |
| 3 | WARN | `bookmark-repository.ts` cross-dir relative import | **FIXED** — uses `@shared/types` |
| 4 | WARN | `tag-repository.ts` cross-dir relative import | **FIXED** — uses `@shared/types` |
| 5 | WARN | `ipc/bookmarks.ts` cross-dir relative imports | **FIXED** — uses `@shared/` aliases |
| 6 | WARN | `ipc/tags.ts` cross-dir relative imports | **FIXED** — uses `@shared/` aliases |
| 7 | WARN | `ipc/file-system.ts` cross-dir relative imports | **FIXED** — uses `@shared/` aliases |
| 8 | WARN | `ipc/app.ts` cross-dir relative imports | **FIXED** — uses `@shared/` aliases |
| 9 | WARN | `ipc/window.ts` cross-dir relative imports | **FIXED** — uses `@shared/` aliases |
| 10 | WARN | `src/main/index.ts` cross-dir relative import | **FIXED** — uses `@shared/types` |
| 11 | WARN | `BookmarkList.tsx` cross-dir relative imports | **FIXED** — uses `@renderer/` aliases |
| 12 | WARN | `BookmarkItem.tsx` cross-dir relative imports | **FIXED** — uses `@shared/`, `@renderer/` aliases |
| 13 | WARN | `TagCheckboxList.tsx` cross-dir relative import | **FIXED** — uses `@shared/types` |
| 14 | WARN | Read handlers wrap in `IpcResult<T>` | **STILL PRESENT** — bookmarks.ts:17,28,39; tags.ts:9 |
| 15 | WARN | `EditBookmarkModal.tsx` 285 lines | **STILL PRESENT** |
| 16 | WARN | `AddBookmarkModal.tsx` 226 lines | **STILL PRESENT** |
| 17 | WARN | `BookmarkItem.tsx` 185 lines | **STILL PRESENT** |

### Notes
- 13 of 17 issues fixed. Both HIGH-severity barrel violations resolved.
- No new architectural violations found.
- Component line length violations are low-risk for v0.1; splitting form-heavy modals requires careful sub-component extraction.
