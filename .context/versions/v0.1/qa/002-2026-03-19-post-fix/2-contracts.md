# Contracts — QA 002 post-fix

_Written by: /agent-orchestrate | 2026-03-19_

## Scope

All fixes in this cycle are **import path corrections only** — no interface, prop, or store shape changes.
No new contracts to define. Existing interfaces remain unchanged.

## Fixes Required

### src/renderer/store/useTagStore.ts
- Line 2: `'../../shared/ipc-channels'` → `'@shared/ipc-channels'`
- Line 3: `'../../shared/types'` → `'@shared/types'`

### src/renderer/hooks/useSearch.ts
- Line 2: `'../../shared/ipc-channels'` → `'@shared/ipc-channels'`
- Line 3: `'../../shared/types'` → `'@shared/types'`

### src/renderer/hooks/useBookmarks.ts
- Line 5: `'../../shared/types'` → `'@shared/types'`

### src/renderer/components/bookmark/BookmarkItem.tsx
- `'../ui/Favicon'` → `'@renderer/components/ui/Favicon'`
- `'../ui/Badge'` → `'@renderer/components/ui/Badge'`

### src/renderer/components/layout/Sidebar.tsx
- `'../search/SearchBar'` → `'@renderer/components/search/SearchBar'`
- `'../tag/TagFilter'` → `'@renderer/components/tag/TagFilter'`
- `'../../store/useBookmarkStore'` → `'@renderer/store/useBookmarkStore'`

### src/renderer/components/tag/TagFilter.tsx
- `'../../store/useTagStore'` → `'@renderer/store/useTagStore'`
- `'../../store/useUIStore'` → `'@renderer/store/useUIStore'`

### src/renderer/components/search/SearchBar.tsx
- `'../../store/useUIStore'` → `'@renderer/store/useUIStore'`
