# QA Report

Generated: 2026-03-18
Overall: FAIL

## Summary

| Category | Result | Issues |
|----------|--------|--------|
| Security | WARN | 3 |
| IPC | WARN | 2 |
| Functional | WARN | 2 |
| Build | WARN | 2 |
| Architecture | FAIL | 14 |

## All Issues (sorted by severity)

| Severity | Category | File | Description |
|----------|----------|------|-------------|
| HIGH | Architecture | src/renderer/components/bookmark/index.ts | Barrel export file — re-exports BookmarkItem, BookmarkList, AddBookmarkModal, EditBookmarkModal; violates no-barrel-exports rule |
| HIGH | Architecture | src/renderer/components/ui/index.ts | Barrel export file — re-exports all UI primitives; violates no-barrel-exports rule |
| MEDIUM | Build | package.json | Windows target (nsis) not defined — app cannot be packaged for Windows |
| WARN | IPC | src/main/ipc/bookmarks.ts | `bookmark:get-by-id` handler exists but no renderer call site found — appears unused |
| WARN | IPC | src/main/ipc/file-system.ts | `fs:export-bookmarks` handler exists but no renderer call site found — export feature unimplemented in UI |
| WARN | Architecture | src/main/db/repositories/bookmark-repository.ts | Cross-directory relative import `../../../shared/types` — should use `@shared/types` |
| WARN | Architecture | src/main/db/repositories/tag-repository.ts | Cross-directory relative import `../../../shared/types` — should use `@shared/types` |
| WARN | Architecture | src/main/ipc/bookmarks.ts | Cross-directory relative imports for `@shared/` — should use aliases |
| WARN | Architecture | src/main/ipc/tags.ts | Cross-directory relative imports for `@shared/` — should use aliases |
| WARN | Architecture | src/main/ipc/file-system.ts | Cross-directory relative imports for `@shared/` — should use aliases |
| WARN | Architecture | src/main/ipc/app.ts | Cross-directory relative imports for `@shared/` — should use aliases |
| WARN | Architecture | src/main/ipc/window.ts | Cross-directory relative imports for `@shared/` — should use aliases |
| WARN | Architecture | src/main/index.ts | Cross-directory relative import `../shared/types` — should use `@shared/types` |
| WARN | Architecture | src/renderer/components/bookmark/BookmarkList.tsx | Cross-directory relative imports for stores/hooks — should use `@renderer/` aliases |
| WARN | Architecture | src/renderer/components/bookmark/BookmarkItem.tsx | Cross-directory relative imports — should use `@shared/`, `@renderer/` aliases |
| WARN | Architecture | src/renderer/components/ui/TagCheckboxList.tsx | Cross-directory relative import `../../../shared/types` — should use `@shared/types` |
| WARN | Architecture | src/main/ipc/bookmarks.ts | All read handlers wrap result in `IpcResult<T>` — convention says reads should return data directly |
| WARN | Architecture | src/renderer/components/bookmark/EditBookmarkModal.tsx | 285 lines — significantly exceeds ~150-line limit; consider splitting |
| WARN | Architecture | src/renderer/components/bookmark/AddBookmarkModal.tsx | 226 lines — exceeds ~150-line limit; consider splitting |
| WARN | Architecture | src/renderer/components/bookmark/BookmarkItem.tsx | 185 lines — slightly exceeds ~150-line limit; consider splitting |
| LOW | Security | src/main/ipc/bookmarks.ts | `BOOKMARK_FETCH_METADATA`: `url` param passed directly to `fetchUrlMetadata` without `isValidUrl()` validation (unlike other URL handlers) |
| LOW | Security | src/main/ipc/tags.ts | `TAG_DELETE`: `id` param not validated before `repo.delete(id)` (unlike `BOOKMARK_DELETE` which calls `isValidId()` first) |
| LOW | Security | src/main/ipc/file-system.ts | `FS_EXPORT_BOOKMARKS`: `bookmarks` array from renderer passed directly to `JSON.stringify` without shape validation |
| LOW | Build | electron.vite.config.ts | `@main` alias not configured — imports using `@main/*` would fail at build time |
| LOW | Functional | src/renderer/hooks/useSearch.ts | Search logic lives in `useSearch` hook rather than `useBookmarkStore` action — minor deviation, functionally complete |
| LOW | Functional | src/renderer/components/Sidebar.tsx | Import flow calls IPC directly from component, bypassing store layer — data refreshes correctly via `fetchAll()` but architecturally inconsistent |

---

## Security

### Result: WARN

### Checklist
- [x] `contextIsolation: true` — found in `src/main/index.ts:57`
- [x] `nodeIntegration: false` — found in `src/main/index.ts:58`
- [x] `sandbox: true` — found in `src/main/index.ts:59`
- [x] preload script used for all IPC bridging — found in `src/main/index.ts:56`
- [x] No `remote` module usage — not found in any file
- [x] No direct `ipcRenderer` exposed via contextBridge — `preload.ts` exposes only `invoke` wrapper and `platform`
- [x] No `webSecurity: false` — not found in any file
- [~] IPC handlers validate input before using — mostly PASS, with gaps (see Issues Found)

### Issues Found

| Severity | File | Line | Description |
|----------|------|------|-------------|
| LOW | src/main/ipc/bookmarks.ts | 104–114 | `BOOKMARK_FETCH_METADATA`: `url` passed directly to `fetchUrlMetadata` without `isValidUrl()` — all other URL handlers validate first |
| LOW | src/main/ipc/tags.ts | 34–42 | `TAG_DELETE`: `id` not validated before `repo.delete(id)` — unlike `BOOKMARK_DELETE` which calls `isValidId()` first |
| LOW | src/main/ipc/file-system.ts | 33–51 | `FS_EXPORT_BOOKMARKS`: `bookmarks` array from renderer passed directly to `JSON.stringify` without shape validation |

### Notes
- `preload.ts` exposes `process.platform` as a static value — explicitly permitted by conventions, no security risk.
- `BOOKMARK_OPEN` validates URL with `isValidUrl()` (http/https only) before `shell.openExternal` — correct defensive pattern.
- `FS_IMPORT_BOOKMARKS` obtains file path via native `dialog.showOpenDialog` in main process — correct pattern.
- All BrowserWindow security settings are fully compliant.

---

## IPC

### Result: WARN

### Channel Coverage

| Channel | Handler | Caller | Shape OK |
|---------|---------|--------|----------|
| `bookmarks:get-all` | ✅ bookmarks.ts:16 | ✅ useBookmarkStore.ts:25 | ✅ |
| `bookmarks:search` | ✅ bookmarks.ts:27 | ✅ useSearch.ts:31 | ✅ |
| `bookmark:get-by-id` | ✅ bookmarks.ts:38 | ❌ No renderer call site found | ✅ |
| `bookmark:create` | ✅ bookmarks.ts:50 | ✅ useBookmarkStore.ts:40 | ✅ |
| `bookmark:update` | ✅ bookmarks.ts:64 | ✅ useBookmarkStore.ts:55 | ✅ |
| `bookmark:delete` | ✅ bookmarks.ts:79 | ✅ useBookmarkStore.ts:78 | ✅ |
| `bookmark:open` | ✅ bookmarks.ts:92 | ✅ useBookmarkStore.ts:95 | ✅ |
| `bookmark:fetch-metadata` | ✅ bookmarks.ts:105 | ✅ useBookmarkForm.ts:79 | ✅ |
| `bookmark:check-duplicate` | ✅ bookmarks.ts:117 | ✅ useBookmarkForm.ts:67 | ✅ |
| `tags:get-all` | ✅ tags.ts:8 | ✅ useTagStore.ts:22 | ✅ |
| `tag:create` | ✅ tags.ts:19 | ✅ useTagStore.ts:37 | ✅ |
| `tag:delete` | ✅ tags.ts:33 | ✅ useTagStore.ts:52 | ✅ |
| `fs:import-bookmarks` | ✅ file-system.ts:10 | ✅ Sidebar.tsx:23 | ✅ |
| `fs:export-bookmarks` | ✅ file-system.ts:32 | ❌ No renderer call site found | ✅ |
| `window:minimize` | ✅ window.ts:6 | ✅ TitleBar.tsx:10 | ✅ |
| `window:maximize` | ✅ window.ts:11 | ✅ TitleBar.tsx:11 | ✅ |
| `window:close` | ✅ window.ts:19 | ✅ TitleBar.tsx:12 | ✅ |
| `app:get-version` | ✅ app.ts:7 | ✅ TitleBar.tsx:16 | ✅ |

### Issues Found

| Severity | Channel | Description |
|----------|---------|-------------|
| WARN | `bookmark:get-by-id` | Handler exists in bookmarks.ts:38 but no renderer call site found |
| WARN | `fs:export-bookmarks` | Handler exists in file-system.ts:32 but no renderer call site — export feature unimplemented in UI |

### Notes
- All read handlers (`bookmarks:get-all`, `bookmarks:search`, `bookmark:get-by-id`, `tags:get-all`) wrap results in `IpcResult<T>` — deviation from convention (reads should return data directly), but consistent end-to-end.
- All channel names correctly follow `domain:action` format.
- All mutation handlers return `{ success: true, data }` or `{ success: false, error }`.

---

## Functional

### Result: WARN

### Flow Trace

| Flow | UI | Store | IPC | Handler | Repo | Status |
|------|----|-------|-----|---------|------|--------|
| Add bookmark | ✅ AddBookmarkModal | ✅ useBookmarkStore.create() | ✅ bookmark:create | ✅ | ✅ LocalBookmarkRepository.create() | PASS |
| Edit bookmark | ✅ EditBookmarkModal | ✅ useBookmarkStore.update() | ✅ bookmark:update | ✅ | ✅ LocalBookmarkRepository.update() | PASS |
| Delete bookmark | ✅ BookmarkItem + EditBookmarkModal | ✅ useBookmarkStore.removeBookmark() | ✅ bookmark:delete | ✅ | ✅ LocalBookmarkRepository.delete() | PASS |
| Search | ✅ SearchBar → useSearch hook | ⚠️ hook, not store action | ✅ bookmarks:search | ✅ | ✅ LocalBookmarkRepository.search() | WARN |
| Tag filter | ✅ TagFilter → useUIStore.toggleTag() → useSearch | ✅ useUIStore + useSearch | ✅ bookmarks:search | ✅ | ✅ LocalBookmarkRepository.search() | PASS |
| Import from browser HTML | ✅ Sidebar "Import from browser…" | ⚠️ IPC called directly from component | ✅ fs:import-bookmarks | ✅ | ✅ LocalBookmarkRepository.create() (batch) | WARN |
| App quit | — | — | — | ✅ app.on('before-quit') | ✅ DB closed cleanly | PASS |

### Issues Found

| Severity | Flow | Description |
|----------|------|-------------|
| LOW | Search | Search logic in `useSearch` hook rather than `useBookmarkStore` — minor architectural deviation, functionally complete |
| LOW | Import from browser HTML | `Sidebar` calls IPC directly, bypassing store layer — data refreshes correctly via `fetchAll()` after success |

### Notes
- `useSearch` uses 300ms debounce and monotonic request ID pattern to prevent race conditions — correct.
- Tag filter enforces single-tag selection in UI even though backend supports OR multi-tag filtering.
- Import shows "added N (M skipped)" status string — satisfies basic requirement, no detailed error modal.
- All IPC channels used in renderer match registered handlers in main. No orphaned channels.
- `app.on('before-quit', closeDatabase)` correctly registered in `src/main/index.ts`.

---

## Build

### Result: WARN

### Config Status

| File | Status | Notes |
|------|--------|-------|
| `electron.vite.config.ts` | EXISTS | Entry points for main, preload, renderer; `@shared` and `@renderer` aliases configured; outputs to `out/` |
| `electron-builder.yml` | MISSING (inline) | Config embedded in `package.json` under `"build"` — functionally equivalent |
| `tsconfig.json` | EXISTS | `strict: true`, path aliases configured, `moduleResolution: bundler` |
| `src/main/tsconfig.json` | NOT PRESENT | Covered by root config |
| `src/renderer/tsconfig.json` | NOT PRESENT | Covered by root config |

### Issues Found

| Severity | File | Description |
|----------|------|-------------|
| MEDIUM | package.json (`build`) | Windows target (`nsis`) not defined — app cannot be packaged for Windows |
| LOW | electron.vite.config.ts | `@main` alias not configured — imports using `@main/*` would fail at build time |

### Notes
- `electron-builder` config inline in `package.json` is valid and functionally equivalent to standalone `electron-builder.yml`.
- `moduleResolution: bundler` is correct for an electron-vite project using modern TypeScript.
- `main` field points to `out/main/index.js` — matches electron-vite's actual default output (`out/`, not `dist/`).
- All key runtime dependencies present: `better-sqlite3`, `electron`, `zustand`, `react`, `react-dom`, `@radix-ui/*`, `cmdk`.

---

## Architecture

### Result: FAIL

### Repository Pattern
- [x] `BookmarkRepository` interface defined
- [x] `LocalBookmarkRepository` implements interface
- [x] `TagRepository` interface defined
- [x] `LocalTagRepository` implements interface
- [x] IPC handlers receive repository via injection (parameter, not direct import)
- [x] No SQLite calls outside of repository files

### IPC Handler Structure
- [x] One handler file per domain — `bookmarks.ts`, `tags.ts`, `window.ts`, `file-system.ts`, `app.ts`
- [x] All handlers registered in `src/main/index.ts`
- [x] Mutation handlers return `{ success, data/error }` shape
- [ ] Read handlers return data directly — all read handlers wrap results in `IpcResult<T>` instead

### Renderer Store
- [x] One store file per domain — `useBookmarkStore.ts`, `useTagStore.ts`, `useUIStore.ts`
- [x] All stores in `src/renderer/store/`
- [x] Stores use `window.electron.invoke()` only — no direct Node access

### Import Conventions
- [ ] Barrel `index.ts` files found in `src/renderer/components/bookmark/` and `src/renderer/components/ui/`
- [ ] Inconsistent path alias usage — newer files use aliases correctly; many in `src/main/` and some renderer components use cross-directory relative paths

### Component Rules
- [x] Props interfaces co-located with components
- [ ] Multiple component files exceed ~150-line limit

### Issues Found

| Severity | File | Line | Description |
|----------|------|------|-------------|
| HIGH | src/renderer/components/bookmark/index.ts | 1–4 | Barrel export file — violates no-barrel-exports rule |
| HIGH | src/renderer/components/ui/index.ts | 1–7 | Barrel export file — violates no-barrel-exports rule |
| WARN | src/main/db/repositories/bookmark-repository.ts | 8 | Cross-directory relative import `../../../shared/types` — use `@shared/types` |
| WARN | src/main/db/repositories/tag-repository.ts | 2 | Cross-directory relative import `../../../shared/types` — use `@shared/types` |
| WARN | src/main/ipc/bookmarks.ts | 2, 10 | Cross-directory relative imports — use `@shared/` aliases |
| WARN | src/main/ipc/tags.ts | 2–3 | Cross-directory relative imports — use `@shared/` aliases |
| WARN | src/main/ipc/file-system.ts | 2–3 | Cross-directory relative imports — use `@shared/` aliases |
| WARN | src/main/ipc/app.ts | 2–3 | Cross-directory relative imports — use `@shared/` aliases |
| WARN | src/main/ipc/window.ts | 2–3 | Cross-directory relative imports — use `@shared/` aliases |
| WARN | src/main/index.ts | 13 | Cross-directory relative import `../shared/types` — use `@shared/types` |
| WARN | src/renderer/components/bookmark/BookmarkList.tsx | 3–5 | Cross-directory relative imports — use `@renderer/` aliases |
| WARN | src/renderer/components/bookmark/BookmarkItem.tsx | 3–4 | Cross-directory relative imports — use `@shared/`, `@renderer/` aliases |
| WARN | src/renderer/components/ui/TagCheckboxList.tsx | 1 | Cross-directory relative import `../../../shared/types` — use `@shared/types` |
| WARN | src/main/ipc/bookmarks.ts | 15–23 | Read handlers wrap results in `IpcResult<T>` — convention says reads should return data directly |
| WARN | src/renderer/components/bookmark/EditBookmarkModal.tsx | — | 285 lines — exceeds ~150-line limit; consider splitting |
| WARN | src/renderer/components/bookmark/AddBookmarkModal.tsx | — | 226 lines — exceeds ~150-line limit; consider splitting |
| WARN | src/renderer/components/bookmark/BookmarkItem.tsx | — | 185 lines — exceeds ~150-line limit; consider splitting |

### Notes
- Delete `src/renderer/components/bookmark/index.ts` and `src/renderer/components/ui/index.ts`; update consumers to import directly (e.g. `@renderer/components/ui/Button`).
- Import alias usage is inconsistent: newer files use `@shared/` and `@renderer/` correctly; older files in `src/main/` still use cross-directory relative paths. All should be migrated.
- Read-handler `IpcResult` wrapping is a convention deviation, but both sides agree on shape — coordinated refactor needed.

---

## Previous QA Notes (from 2026-03-15)

The following bugs were fixed in a prior QA pass and are no longer present:

| # | Bug | File | Fix Applied |
|---|-----|------|-------------|
| 1 | `@shared` alias not in Vite config → import resolution failure | `electron.vite.config.ts` | Added `resolve.alias` for `@shared` |
| 2 | CSP `script-src 'self'` blocking Vite dev scripts | `src/renderer/index.html` | Removed meta CSP tag |
| 3 | `icon={Bookmark}` passing forwardRef object as ReactNode | `BookmarkList.tsx` | Changed to `icon={<Bookmark size={20} />}` |
| 4 | `EmptyState.action` typed as `ReactNode` but received plain object | `EmptyState.tsx` | Changed to structured `ActionProps` type |
| 5 | `App.tsx` referencing `editingBookmark` (not in UIStore) | `App.tsx` | Removed stale destructure |
| 6 | `BookmarkList` reading wrong store for `selectedBookmarkId` | `BookmarkList.tsx` | Moved to `useUIStore` |
| 7 | `deleteBookmark` called on store (method named `delete`) | `BookmarkItem.tsx`, `EditBookmarkModal.tsx` | Changed to `s.delete` |
| 8 | `openUrl(bookmark.url)` — store takes `id: number`, not url string | `BookmarkItem.tsx` | Changed to `openUrl(bookmark.id)` |
| 9 | `Modal` missing `width` and `footer` props | `Modal.tsx` | Added optional props |
| 10 | `Input` missing `isLoading` prop | `Input.tsx` | Added `isLoading?: boolean` |
| 11 | `<Badge count={extraTagCount} />` — Badge has no `count` prop | `BookmarkItem.tsx` | Changed to `<Badge variant="gray">+{n}</Badge>` |
| 12 | CSS custom properties (`--color-*`) not defined | `index.css` | Added full `:root` token set |
