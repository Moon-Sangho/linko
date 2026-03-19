# File Ownership — Patch 010: Bulk Select & Delete

_Written by: /agent-orchestrate | 2026-03-19_

---

## Agent A — UI Components

### OWNS (create or modify only these files)

| File | Action |
|------|--------|
| `src/renderer/components/bookmark/BookmarkItem.tsx` | Modify — add checkbox UI + props |
| `src/renderer/components/bookmark/BookmarkList.tsx` | Modify — pass selection state, mount BulkActionBar, handle ⌘A/Esc/⌘⌫ |
| `src/renderer/components/bookmark/BulkActionBar.tsx` | Create new |
| `src/renderer/components/bookmark/BulkDeleteModal.tsx` | Create new |

### MUST NOT TOUCH

- `src/renderer/store/useUIStore.ts`
- `src/renderer/store/useBookmarkStore.ts`
- `src/renderer/store/useTagStore.ts`
- `src/renderer/hooks/useKeyboardShortcuts.tsx`
- `src/shared/types.ts`
- `src/shared/ipc-channels.ts`
- `src/renderer/App.tsx`
- Any file under `src/main/`

---

## Agent B — Store

### OWNS (modify only these files)

| File | Action |
|------|--------|
| `src/renderer/store/useUIStore.ts` | Modify — add selection state + actions |
| `src/renderer/store/useBookmarkStore.ts` | Modify — add `removeBulk` |

### MUST NOT TOUCH

- Any file under `src/renderer/components/`
- `src/renderer/hooks/`
- `src/renderer/App.tsx`
- `src/shared/types.ts`
- `src/shared/ipc-channels.ts`
- Any file under `src/main/`
