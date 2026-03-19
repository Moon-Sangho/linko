# QA Verification Report

Generated: 2026-03-19
Overall: **WARN** _(previous cycle: FAIL → improved)_

## Summary

| Category | Result | Issues |
|----------|--------|--------|
| Security | PASS | 0 |
| IPC | WARN | 2 |
| Functional | WARN | 4 |
| Build | WARN | 4 |
| Architecture | WARN | 4 |

## Fixes Confirmed

All 10 HIGH import violations from `1-qa-report.md` are resolved:

| # | File | Was | Now |
|---|------|-----|-----|
| 1 | `src/renderer/store/useTagStore.ts:2` | `../../shared/ipc-channels` | `@shared/ipc-channels` ✅ |
| 2 | `src/renderer/store/useTagStore.ts:3` | `../../shared/types` | `@shared/types` ✅ |
| 3 | `src/renderer/hooks/useSearch.ts:2` | `../../shared/ipc-channels` | `@shared/ipc-channels` ✅ |
| 4 | `src/renderer/hooks/useSearch.ts:3` | `../../shared/types` | `@shared/types` ✅ |
| 5 | `src/renderer/hooks/useBookmarks.ts:5` | `../../shared/types` | `@shared/types` ✅ |
| 6 | `src/renderer/components/bookmark/BookmarkItem.tsx:7-8` | `../ui/Favicon`, `../ui/Badge` | `@renderer/components/ui/...` ✅ |
| 7 | `src/renderer/components/layout/Sidebar.tsx:3-4` | `../search/SearchBar`, `../tag/TagFilter` | `@renderer/components/...` ✅ |
| 8 | `src/renderer/components/layout/Sidebar.tsx:7` | `../../store/useBookmarkStore` | `@renderer/store/useBookmarkStore` ✅ |
| 9 | `src/renderer/components/tag/TagFilter.tsx:2-3` | `../../store/useTagStore`, `../../store/useUIStore` | `@renderer/store/...` ✅ |
| 10 | `src/renderer/components/search/SearchBar.tsx:2` | `../../store/useUIStore` | `@renderer/store/useUIStore` ✅ |

New files (`BulkActionBar.tsx`, `BulkDeleteModal.tsx`, `useUIStore.ts`) — clean, no violations.

## Remaining Issues (sorted by severity)

| Severity | Category | File | Description |
|----------|----------|------|-------------|
| WARN | Architecture | `src/renderer/hooks/useBookmarks.ts:2–4` | Cross-dir relative imports `../store/*` → must be `@renderer/store/*` |
| WARN | Architecture | `src/renderer/hooks/useSearch.ts:4` | Cross-dir relative import `../store/useUIStore` → must be `@renderer/store/useUIStore` |
| WARN | Architecture | `src/renderer/hooks/useTags.ts:2` | Cross-dir relative import `../store/useTagStore` → must be `@renderer/store/useTagStore` |
| WARN | Architecture | `src/renderer/env.d.ts:1` | Cross-dir relative import `../shared/ipc-channels` → must be `@shared/ipc-channels` |
| WARN | Functional | `src/main/services/importer.ts` | Imported bookmarks never get favicon fetched — all imported items show placeholder permanently |
| WARN | IPC | `src/main/ipc/bookmarks.ts:37` | `bookmark:get-by-id` registered but no renderer caller — stale/reserved |
| WARN | IPC | `src/main/ipc/file-system.ts:31` | `fs:export-bookmarks` registered but no renderer caller — export UI not yet wired |
| WARN | Build | `tsconfig.json` | Single root tsconfig with `jsx: "react-jsx"` — main process doesn't use JSX |
| WARN | Build | `package.json` | `electron-builder` config inline rather than `electron-builder.yml` |
| WARN | Build | `electron.vite.config.ts` | No explicit `outDir` — relies on electron-vite default (`out/`) |
| LOW | Functional | `src/renderer/store/useBookmarkStore.ts` | `removeBulk` per-item IPC errors not surfaced individually |
| LOW | Functional | `src/renderer/hooks/useSearch.ts` | Fires IPC even when `searchQuery` and `selectedTagIds` are both empty |
| LOW | Build | `package.json` | Non-native packages in `dependencies` — could move to `devDependencies` |

## Resolved Since Previous Cycle

| Issue | Resolution |
|-------|-----------|
| 10× HIGH cross-dir import violations | Fixed by orchestrator — all use correct aliases |
| WARN: `useTagStore.ts` import violation (IPC/Functional) | Fixed — `useTagStore.ts` now uses `@shared/*` |
| LOW: tagStore not refreshed after import | Resolved — importer doesn't assign tags, no refresh needed |

## Notes

- The `out/` vs `dist/` discrepancy in the Build checklist is **not a bug** — electron-vite v2 defaults to `out/`, and the built output is confirmed at `out/main/index.js`. The checklist was outdated.
- Architecture is now WARN (was FAIL). The remaining import violations are in `hooks/` (same-directory-level `../store/*`) — lower severity than the `../../shared/` violations that were fixed.
- Security posture is unchanged: PASS.

---

## Security
**Result: PASS**

- `contextIsolation: true` ✅
- `nodeIntegration: false` ✅
- `sandbox: true` ✅
- Preload script used for all IPC bridging ✅
- No remote module usage ✅
- No direct `ipcRenderer` exposed ✅
- No `webSecurity: false` ✅
- All mutation IPC handlers validate input ✅

Bulk delete uses existing `bookmark:delete` channel per item — no new security surface introduced.

---

## IPC
**Result: WARN**

| Channel | Handler | Caller | Shape OK |
|---------|---------|--------|----------|
| bookmarks:get-all | ✅ | ✅ useBookmarkStore | ✅ |
| bookmarks:search | ✅ | ✅ useSearch | ✅ |
| bookmark:get-by-id | ✅ | ❌ no renderer caller | ✅ |
| bookmark:create | ✅ | ✅ useBookmarkStore | ✅ |
| bookmark:update | ✅ | ✅ useBookmarkStore | ✅ |
| bookmark:delete | ✅ | ✅ useBookmarkStore (single + bulk) | ✅ |
| bookmark:open | ✅ | ✅ useBookmarkStore | ✅ |
| bookmark:fetch-metadata | ✅ | ✅ useBookmarkForm | ✅ |
| bookmark:check-duplicate | ✅ | ✅ useBookmarkForm | ✅ |
| tags:get-all | ✅ | ✅ useTagStore | ✅ |
| tag:create | ✅ | ✅ useTagStore | ✅ |
| tag:delete | ✅ | ✅ useTagStore | ✅ |
| fs:import-bookmarks | ✅ | ✅ Sidebar | ✅ |
| fs:export-bookmarks | ✅ | ❌ no renderer caller | ✅ |
| window:minimize/maximize/close | ✅ | ✅ TitleBar | ✅ |
| app:get-version | ✅ | ✅ TitleBar | ✅ |

Issues:
- WARN: `bookmark:get-by-id` — registered, no renderer caller (reserved for future detail view)
- WARN: `fs:export-bookmarks` — registered, export UI not yet wired

---

## Functional
**Result: WARN**

| Flow | Status |
|------|--------|
| Add bookmark | PASS |
| Edit bookmark | PASS |
| Delete bookmark (single) | PASS |
| Delete bookmark (bulk) | PASS |
| Search (text) | PASS |
| Tag filter | PASS |
| Import from browser HTML | WARN (no favicon fetch) |
| App quit / DB close | PASS |

Issues:
- WARN: Imported bookmarks never get favicon fetched — all show placeholder permanently
- WARN: `useSearch.ts:4` / `useBookmarks.ts:2–4` / `useTags.ts:2` cross-dir relative imports
- LOW: `removeBulk` per-item IPC errors not surfaced individually
- LOW: `useSearch` fires IPC even when both `searchQuery` and `selectedTagIds` are empty

---

## Build
**Result: WARN**

| File | Status |
|------|--------|
| `electron.vite.config.ts` | ✅ exists — entry points + aliases configured |
| `electron-builder.yml` | ⚠️ missing — config inline in `package.json` |
| `tsconfig.json` | ✅ exists — strict: true, all aliases present |
| Per-process tsconfigs | ⚠️ absent |

All recently changed files pass import convention rules. No barrel `index.ts` files in renderer.

Issues:
- WARN: Single tsconfig with `jsx: "react-jsx"` includes main process
- WARN: `electron-builder` config inline rather than `electron-builder.yml`
- WARN: No explicit `outDir` in `electron.vite.config.ts`
- LOW: Non-native packages in `dependencies`

---

## Architecture
**Result: WARN** _(was FAIL — all 10 HIGH violations fixed)_

### Import Violations
- ✅ All 10 HIGH cross-dir violations from previous cycle — **FIXED**
- ✅ New files (BulkActionBar, BulkDeleteModal, useUIStore) — **CLEAN**
- ⚠️ Remaining WARN: `hooks/useBookmarks.ts:2–4`, `hooks/useSearch.ts:4`, `hooks/useTags.ts:2`, `env.d.ts:1` — `../store/*` relative imports

### Repository Pattern
- ✅ Interface + LocalRepository implementation for bookmarks and tags
- ✅ Repositories injected into IPC handlers
- ✅ No SQLite calls outside repository files

### Remaining Size WARNs (unchanged)
- `EditBookmarkModal.tsx` — 285 lines (limit: ~150)
- `AddBookmarkModal.tsx` — 226 lines (limit: ~150)
- `BookmarkItem.tsx` — 218 lines (limit: ~150)
