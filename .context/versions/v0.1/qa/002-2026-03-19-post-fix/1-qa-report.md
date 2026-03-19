# QA Report

Generated: 2026-03-19
Overall: **FAIL**

## Summary

| Category | Result | Issues |
|----------|--------|--------|
| Security | PASS | 0 |
| IPC | WARN | 3 |
| Functional | WARN | 5 |
| Build | WARN | 5 |
| Architecture | FAIL | 17 |

## All Issues (sorted by severity)

| Severity | Category | File | Description |
|----------|----------|------|-------------|
| HIGH | Architecture | `src/renderer/store/useTagStore.ts:2` | Cross-dir relative import `../../shared/ipc-channels` → must be `@shared/ipc-channels` |
| HIGH | Architecture | `src/renderer/store/useTagStore.ts:3` | Cross-dir relative import `../../shared/types` → must be `@shared/types` |
| HIGH | Architecture | `src/renderer/hooks/useSearch.ts:2` | Cross-dir relative import `../../shared/ipc-channels` → must be `@shared/ipc-channels` |
| HIGH | Architecture | `src/renderer/hooks/useSearch.ts:3` | Cross-dir relative import `../../shared/types` → must be `@shared/types` |
| HIGH | Architecture | `src/renderer/hooks/useBookmarks.ts:5` | Cross-dir relative import `../../shared/types` → must be `@shared/types` |
| HIGH | Architecture | `src/renderer/components/bookmark/BookmarkItem.tsx:7-8` | Cross-dir relative imports `../ui/Favicon`, `../ui/Badge` → must use `@renderer/components/ui/...` |
| HIGH | Architecture | `src/renderer/components/layout/Sidebar.tsx:3-4` | Cross-dir relative imports `../search/SearchBar`, `../tag/TagFilter` → must use `@renderer/components/...` |
| HIGH | Architecture | `src/renderer/components/layout/Sidebar.tsx:7` | Cross-dir relative import `../../store/useBookmarkStore` → must be `@renderer/store/useBookmarkStore` |
| HIGH | Architecture | `src/renderer/components/tag/TagFilter.tsx:2-3` | Cross-dir relative imports `../../store/useTagStore`, `../../store/useUIStore` → must use `@renderer/store/...` |
| HIGH | Architecture | `src/renderer/components/search/SearchBar.tsx:2` | Cross-dir relative import `../../store/useUIStore` → must be `@renderer/store/useUIStore` |
| HIGH | Build | `package.json` | `main` field points to `out/main/index.js` — checklist expects `dist/`; confirm electron-vite `outDir` default (`out/`) matches intentional convention |
| WARN | Architecture | `src/main/ipc/bookmarks.ts:17-24,27-35,37-47` | Read handlers `BOOKMARKS_GET_ALL`, `BOOKMARKS_SEARCH`, `BOOKMARK_GET_BY_ID` wrap result in `{ success, data }` — convention requires read handlers to return data directly |
| WARN | Architecture | `src/main/ipc/tags.ts:7-16` | Read handler `TAGS_GET_ALL` wraps in `{ success, data }` — same convention deviation |
| WARN | Architecture | `src/renderer/components/bookmark/EditBookmarkModal.tsx` | 285 lines — exceeds ~150 line component guideline |
| WARN | Architecture | `src/renderer/components/bookmark/AddBookmarkModal.tsx` | 226 lines — exceeds ~150 line component guideline |
| WARN | Architecture | `src/renderer/components/bookmark/BookmarkItem.tsx` | 218 lines — exceeds ~150 line component guideline |
| WARN | IPC | `src/main/ipc/bookmarks.ts:38` | `bookmark:get-by-id` handler registered but no renderer call site found — likely stale or reserved |
| WARN | IPC | `src/main/ipc/file-system.ts:32` | `fs:export-bookmarks` handler registered but no renderer call site found — export UI not yet wired |
| WARN | IPC | `src/renderer/store/useTagStore.ts` | Import path violation (same as Architecture HIGH — fix there covers this) |
| WARN | Build | `package.json` | `electron-builder` config inline in `package.json` rather than `electron-builder.yml` |
| WARN | Build | `electron.vite.config.ts` | No explicit `outDir` set; relies on electron-vite default (`out/`) — should be explicit |
| WARN | Build | `tsconfig.json` | Single root tsconfig with `jsx: "react-jsx"` applies to main process, which does not use JSX |
| WARN | Functional | `src/main/services/importer.ts` | Imported bookmarks never get favicon fetched — shows placeholder for all imported items |
| WARN | Functional | `src/renderer/store/useTagStore.ts` + `useSearch.ts` | Cross-dir relative imports (same as Architecture HIGH) |
| LOW | Build | `package.json` | Non-native packages (`zustand`, `@radix-ui/*`, `lucide-react`, etc.) in `dependencies` — could move to `devDependencies` since Vite bundles them |
| LOW | Functional | `src/main/services/importer.ts` | After import, `tagStore` is not refreshed — fragile if importer ever assigns tags |
| LOW | Functional | `src/renderer/store/useBookmarkStore.ts` | `removeBulk` per-item IPC errors not surfaced individually — any failure triggers full `fetchAll`, silent partial failures possible |
| LOW | Functional | `src/renderer/hooks/useSearch.ts` | Hook fires debounced IPC call even when `searchQuery` and `selectedTagIds` are both empty — unnecessary round-trips |

---

## Security

**Result: PASS**

### Checklist
- [x] `contextIsolation: true` — `src/main/index.ts:57`
- [x] `nodeIntegration: false` — `src/main/index.ts:58`
- [x] `sandbox: true` — `src/main/index.ts:59`
- [x] Preload script used for all IPC bridging — `src/main/preload.ts`
- [x] No `remote` module usage
- [x] No direct `ipcRenderer` exposed via contextBridge — only `invoke` wrapper and static `platform`
- [x] No `webSecurity: false`
- [x] IPC handlers validate input before using

### Notes
- `BOOKMARKS_SEARCH` and `BOOKMARK_CHECK_DUPLICATE` lack proactive input shape validation (wrapped in try/catch, so failures are handled gracefully — minor gap for consistency)
- `FS_EXPORT_BOOKMARKS` validates `bookmarks` is an array before writing; per-item sanitization not needed for file write

---

## IPC

**Result: WARN**

### Channel Coverage

| Channel | Handler | Caller | Shape OK |
|---------|---------|--------|----------|
| `bookmarks:get-all` | ✅ bookmarks.ts:16 | ✅ useBookmarkStore.ts:26 | ✅ |
| `bookmarks:search` | ✅ bookmarks.ts:27 | ✅ useSearch.ts:31 | ✅ |
| `bookmark:get-by-id` | ✅ bookmarks.ts:38 | ❌ no renderer caller | ✅ |
| `bookmark:create` | ✅ bookmarks.ts:50 | ✅ useBookmarkStore.ts:41 | ✅ |
| `bookmark:update` | ✅ bookmarks.ts:64 | ✅ useBookmarkStore.ts:56 | ✅ |
| `bookmark:delete` | ✅ bookmarks.ts:79 | ✅ useBookmarkStore.ts:79,106 | ✅ |
| `bookmark:open` | ✅ bookmarks.ts:92 | ✅ useBookmarkStore.ts:117 | ✅ |
| `bookmark:fetch-metadata` | ✅ bookmarks.ts:105 | ✅ useBookmarkForm.ts:79 | ✅ |
| `bookmark:check-duplicate` | ✅ bookmarks.ts:118 | ✅ useBookmarkForm.ts:67 | ✅ |
| `tags:get-all` | ✅ tags.ts:8 | ✅ useTagStore.ts:22 | ✅ |
| `tag:create` | ✅ tags.ts:19 | ✅ useTagStore.ts:37 | ✅ |
| `tag:delete` | ✅ tags.ts:33 | ✅ useTagStore.ts:52 | ✅ |
| `fs:import-bookmarks` | ✅ file-system.ts:10 | ✅ Sidebar.tsx:23 | ✅ |
| `fs:export-bookmarks` | ✅ file-system.ts:32 | ❌ no renderer caller | ✅ |
| `window:minimize` | ✅ window.ts:6 | ✅ TitleBar.tsx:10 | ✅ |
| `window:maximize` | ✅ window.ts:11 | ✅ TitleBar.tsx:11 | ✅ |
| `window:close` | ✅ window.ts:19 | ✅ TitleBar.tsx:12 | ✅ |
| `app:get-version` | ✅ app.ts:7 | ✅ TitleBar.tsx:16 | ✅ |

### Issues
- WARN: `bookmark:get-by-id` — registered, no renderer caller (likely reserved for future use)
- WARN: `fs:export-bookmarks` — registered, export UI not yet wired
- WARN: `useTagStore.ts` import path violation (covered by Architecture HIGH fixes)
- NOTE: All read handlers wrap in `{ success, data }` — renderer handles this shape consistently, but deviates from `main-conventions.md`

---

## Functional

**Result: WARN**

### Flow Trace

| Flow | Status |
|------|--------|
| Add bookmark | PASS |
| Edit bookmark | PASS |
| Delete bookmark (single) | PASS |
| Delete bookmark (bulk) | PASS (with LOW caveat) |
| Search (text) | PASS |
| Tag filter | PASS |
| Import from browser HTML | PASS |
| App quit / DB close | PASS |

### Issues
- WARN: Imported bookmarks never get favicon fetched — all show placeholder
- WARN: `useTagStore.ts` / `useSearch.ts` import path violations (covered by Architecture HIGH)
- LOW: After import, `tagStore` not refreshed — fragile if importer ever assigns tags
- LOW: `removeBulk` per-item IPC errors not surfaced individually; any failure triggers full `fetchAll`
- LOW: `useSearch` fires IPC even when `searchQuery` and `selectedTagIds` are empty

### Notes
- Tag filter is single-select only in UI (even though `bookmarks:search` API supports multi-tag). Design choice, not a bug.

---

## Build

**Result: WARN**

### Config Status

| File | Status |
|------|--------|
| `electron.vite.config.ts` | ✅ exists — aliases + entry points configured |
| `electron-builder.yml` | ⚠️ not present — config embedded in `package.json` |
| `tsconfig.json` | ✅ exists — `strict: true`, all three aliases present |
| Per-process tsconfigs | ⚠️ absent — single root tsconfig only |

### Issues
- HIGH: `main` field `out/main/index.js` vs checklist `dist/` — internally consistent with electron-vite default (`out/`); checklist likely outdated but should be confirmed
- WARN: `electron-builder` config inline in `package.json` rather than `electron-builder.yml`
- WARN: No explicit `outDir` in `electron.vite.config.ts` — relies on electron-vite default
- WARN: Single root tsconfig with `jsx: "react-jsx"` applies to main process (which doesn't use JSX)
- LOW: Non-native packages (`zustand`, `@radix-ui/*`, `lucide-react`, etc.) in `dependencies` — Vite bundles them so `devDependencies` would be more accurate

### Notes
- `postinstall` script (`electron-rebuild -f -w better-sqlite3`) correctly in place
- `asar: true`, `appId`, `productName`, mac/win targets all correctly set

---

## Architecture

**Result: FAIL**

### Repository Pattern
- [x] `BookmarkRepository` interface + `LocalBookmarkRepository` implementation
- [x] `TagRepository` interface + `LocalTagRepository` implementation
- [x] Repositories injected into IPC handlers (not imported directly)
- [x] No SQLite calls outside repository files

### IPC Handler Structure
- [x] One handler file per domain
- [x] All handlers registered in `src/main/index.ts`
- [x] Mutation handlers return `{ success, data/error }`
- [ ] Read handlers should return data directly — all 4 read handlers wrap in `{ success, data }` instead

### Import Conventions
- [x] No barrel `index.ts` files anywhere in renderer
- [ ] 10 cross-directory relative imports across 5 renderer files — all must use `@renderer/` or `@shared/` aliases

### Component Size
- [ ] `EditBookmarkModal.tsx` — 285 lines (limit: ~150)
- [ ] `AddBookmarkModal.tsx` — 226 lines (limit: ~150)
- [ ] `BookmarkItem.tsx` — 218 lines (limit: ~150)

### Files with Import Violations
| File | Lines | Fix |
|------|-------|-----|
| `src/renderer/store/useTagStore.ts` | 2–3 | `../../shared/*` → `@shared/*` |
| `src/renderer/hooks/useSearch.ts` | 2–3 | `../../shared/*` → `@shared/*` |
| `src/renderer/hooks/useBookmarks.ts` | 5 | `../../shared/types` → `@shared/types` |
| `src/renderer/components/bookmark/BookmarkItem.tsx` | 7–8 | `../ui/*` → `@renderer/components/ui/*` |
| `src/renderer/components/layout/Sidebar.tsx` | 3–4, 7 | relative cross-dir → `@renderer/...` |
| `src/renderer/components/tag/TagFilter.tsx` | 2–3 | `../../store/*` → `@renderer/store/*` |
| `src/renderer/components/search/SearchBar.tsx` | 2 | `../../store/useUIStore` → `@renderer/store/useUIStore` |
