# QA Checklist — Linko v0.1

## Bugs Fixed (2026-03-15)

### Critical (caused blank screen / runtime crash)

| # | Bug | File | Fix |
|---|-----|------|-----|
| 1 | `@shared` alias not in Vite config → import resolution failure | `electron.vite.config.ts` | Added `resolve.alias` for `@shared` in all 3 sections |
| 2 | CSP `script-src 'self'` blocking Vite dev scripts (no `unsafe-eval`) | `src/renderer/index.html` | Removed meta CSP tag |
| 3 | `icon={Bookmark}` passing forwardRef object as ReactNode child | `BookmarkList.tsx` | Changed to `icon={<Bookmark size={20} />}` |
| 4 | `EmptyState.action` typed as `ReactNode` but received plain object | `EmptyState.tsx` | Changed to structured `ActionProps` type with internal button render |
| 5 | `App.tsx` referencing `editingBookmark` (not in UIStore) + passing props to self-contained modals | `App.tsx` | Removed stale destructure; simplified to `<AddBookmarkModal />` / `<EditBookmarkModal />` |
| 6 | `BookmarkList` reading `selectedBookmarkId`/`selectBookmark` from `useBookmarkStore` (they live in `useUIStore`) | `BookmarkList.tsx` | Moved to `useUIStore.selectedBookmarkId` / `setSelectedBookmark` |

### API Mismatch (runtime errors on feature use)

| # | Bug | File | Fix |
|---|-----|------|-----|
| 7 | `deleteBookmark` called on store (method is named `delete`) | `BookmarkItem.tsx`, `EditBookmarkModal.tsx` | Changed to `s.delete` |
| 8 | `openUrl(bookmark.url)` — store takes `id: number`, not url string | `BookmarkItem.tsx` | Changed to `openUrl(bookmark.id)` |
| 9 | `Modal` missing `width` and `footer` props (used by both modals) | `Modal.tsx` | Added optional `width: number` and `footer: ReactNode` |
| 10 | `Input` missing `isLoading` prop (used in AddBookmarkModal / EditBookmarkModal) | `Input.tsx` | Added `isLoading?: boolean` to InputProps |
| 11 | `<Badge count={extraTagCount} />` — Badge has no `count` prop, uses `children` | `BookmarkItem.tsx` | Changed to `<Badge variant="gray">+{extraTagCount}</Badge>` |

### Visual (no crash, but unstyled)

| # | Bug | File | Fix |
|---|-----|------|-----|
| 12 | CSS custom properties (`--color-*`) used everywhere but not defined | `index.css` | Added full `:root` token set |

---

## Known False-Positive TypeScript Errors (LSP only, not runtime)

- `Cannot find module 'lucide-react'` — package is installed and symlinked correctly via pnpm. `typings` field points to valid `.d.ts`. Vite resolves correctly at runtime. Likely LSP symlink traversal issue.

---

## Security Review

| Check | Status |
|-------|--------|
| `contextIsolation: true` | ✅ |
| `nodeIntegration: false` | ✅ |
| `sandbox: true` | ✅ |
| Preload uses `contextBridge` only | ✅ |
| No `remote` module usage | ✅ |
| CSP removed from HTML (managed by Electron session) | ✅ |

---

## Functional Test Status

| Flow | Status | Notes |
|------|--------|-------|
| App launches | 🟡 Pending | Blocked on blank screen bugs (now fixed) |
| Empty state renders | 🟡 Pending | After CSS var fix |
| Add bookmark | 🟡 Pending | IPC handler exists in main |
| Edit bookmark | 🟡 Pending | IPC handler exists in main |
| Delete bookmark | 🟡 Pending | IPC handler exists in main |
| Search / tag filter | 🟡 Pending | Hook implemented, FTS in SQLite |
| App quits cleanly | 🟡 Pending | `closeDatabase()` on before-quit |
