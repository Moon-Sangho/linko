# File Ownership — QA Fix Sprint

## Agent A — Renderer Component Fixes

### OWNS (touch only these)
- `src/renderer/components/bookmark/index.ts` → DELETE
- `src/renderer/components/ui/index.ts` → DELETE
- `src/renderer/components/bookmark/BookmarkItem.tsx` → fix imports
- `src/renderer/components/bookmark/BookmarkList.tsx` → fix imports
- `src/renderer/components/ui/TagCheckboxList.tsx` → fix imports

### MUST NOT TOUCH
- Anything in `src/main/`
- `electron.vite.config.ts`
- `package.json`
- `src/shared/types.ts`
- `src/shared/ipc-channels.ts`
- Any other renderer file not listed above

---

## Agent B — Main Process Fixes

### OWNS (touch only these)
- `src/main/ipc/bookmarks.ts` → fix imports + add URL validation to BOOKMARK_FETCH_METADATA
- `src/main/ipc/tags.ts` → fix imports + add ID validation to TAG_DELETE
- `src/main/ipc/file-system.ts` → fix imports + add array validation to FS_EXPORT_BOOKMARKS
- `src/main/ipc/app.ts` → fix imports
- `src/main/ipc/window.ts` → fix imports
- `src/main/index.ts` → fix imports
- `src/main/db/repositories/bookmark-repository.ts` → fix imports
- `src/main/db/repositories/tag-repository.ts` → fix imports

### MUST NOT TOUCH
- Anything in `src/renderer/`
- `electron.vite.config.ts`
- `package.json`
- `src/shared/types.ts`
- `src/shared/ipc-channels.ts`

---

## Agent C — Config Fixes

### OWNS (touch only these)
- `electron.vite.config.ts` → add `@main` alias
- `package.json` → add Windows build target

### MUST NOT TOUCH
- Anything in `src/`
