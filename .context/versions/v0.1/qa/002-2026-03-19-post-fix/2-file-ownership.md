# File Ownership — QA 002 post-fix

_Written by: /agent-orchestrate | 2026-03-19_

## Note

All fixes are import path corrections. No parallel sub-agents required.
Orchestrator applies all fixes directly in Phase 4.

## Files Modified

| File | Fix |
|------|-----|
| `src/renderer/store/useTagStore.ts` | @shared alias |
| `src/renderer/hooks/useSearch.ts` | @shared alias |
| `src/renderer/hooks/useBookmarks.ts` | @shared alias |
| `src/renderer/components/bookmark/BookmarkItem.tsx` | @renderer alias |
| `src/renderer/components/layout/Sidebar.tsx` | @renderer alias |
| `src/renderer/components/tag/TagFilter.tsx` | @renderer alias |
| `src/renderer/components/search/SearchBar.tsx` | @renderer alias |

## MUST NOT TOUCH

- `src/shared/types.ts`
- `src/shared/ipc-channels.ts`
- `src/main/`
- `src/renderer/App.tsx`
