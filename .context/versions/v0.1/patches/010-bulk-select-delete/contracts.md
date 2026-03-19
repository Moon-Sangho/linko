# Contracts — Patch 010: Bulk Select & Delete

_Written by: /agent-orchestrate | 2026-03-19_
_These interfaces are frozen. Agents must implement exactly as defined here._

---

## useUIStore — additions (Agent B)

```typescript
// Additions to the existing UIStore interface
// (existing fields selectedBookmarkId, searchQuery, selectedTagIds, and their actions remain unchanged)

selectedBookmarkIds: number[]           // IDs of bookmarks checked for bulk action
// NOTE: isSelectionMode is DERIVED — compute as selectedBookmarkIds.length > 0
//       Do NOT add isSelectionMode as a stored field

toggleBookmarkSelection: (id: number) => void   // adds if absent, removes if present
selectAllBookmarks: (ids: number[]) => void      // replaces selectedBookmarkIds with given ids
clearSelection: () => void                       // resets selectedBookmarkIds to []
```

---

## useBookmarkStore — additions (Agent B)

```typescript
// Addition to the existing BookmarkStore interface

removeBulk: (ids: number[]) => Promise<void>
// Implementation: optimistic — remove all ids from local bookmarks state first,
// then fire BOOKMARK_DELETE IPC calls in parallel (Promise.all).
// On any error: re-fetch all bookmarks to restore consistent state (call fetchAll).
// Also prune orphaned tags (same pattern as removeBookmark).
```

---

## BookmarkItem — additional props (Agent A)

```typescript
// ADDITIONS to existing BookmarkItemProps
// (existing isSelected: boolean and onClick: () => void remain unchanged)

isChecked: boolean           // whether this item is in bulk selection
isSelectionMode: boolean     // whether any item is selected (drives checkbox visibility)
onCheckToggle: (id: number) => void  // called when checkbox is clicked
```

Behavior changes:
- When `isSelectionMode === true`: hide hover action buttons (open/edit/delete)
- Checkbox: `opacity-0 group-hover:opacity-100` in normal mode, always visible in selection mode
- Checked item background: `bg-[var(--color-accent-subtle)]`, left border: `border-l-2 border-l-[var(--color-accent)]`
- Checkbox click must call `e.stopPropagation()` (does not trigger `onClick`)

---

## BulkActionBar — new component (Agent A)

**File**: `src/renderer/components/bookmark/BulkActionBar.tsx`

```typescript
interface BulkActionBarProps {
  selectedCount: number       // number of checked items
  totalCount: number          // total visible bookmarks (for select-all state)
  isDeleting: boolean         // shows spinner on Delete button, disables all
  onSelectAll: () => void     // called when "select all" checkbox toggled on
  onDeselectAll: () => void   // called when "select all" checkbox toggled off
  onDeleteRequest: () => void // called when Delete button clicked
  onClear: () => void         // called when Clear button clicked
}
```

Visual:
- Renders only when `selectedCount > 0` (parent controls mount/unmount)
- Position: `sticky bottom-0` inside bookmark list scroll container
- Height: 48px, `bg-gray-800 border-t border-gray-700`
- "Select all" checkbox on left: indeterminate (`−`) when `selectedCount < totalCount`, checked when `selectedCount === totalCount`
- Center: `{N} selected` — `text-sm text-gray-300`
- Right: "Delete {N}" (`variant="danger" size="sm"`) + "Clear" (`variant="ghost" size="sm"`)
- When `isDeleting`: both buttons disabled, Delete button shows `<Spinner size="sm" />`

---

## BulkDeleteModal — new component (Agent A)

**File**: `src/renderer/components/bookmark/BulkDeleteModal.tsx`

```typescript
interface BulkDeleteModalProps {
  isOpen: boolean
  count: number       // number of bookmarks to delete
  isDeleting: boolean // shows spinner, disables buttons
  onConfirm: () => void
  onCancel: () => void
}
```

Visual:
- Uses existing `<Modal>` primitive at `width={400}`
- Title: `"Delete {count} bookmark{count === 1 ? '' : 's'}?"`
- Body: `"This will permanently delete {count} bookmark{s}. This cannot be undone."`
- Footer: `[Cancel]` (ghost) + `[Delete {count}]` (danger, spinner when isDeleting)
- `onCancel` also called on backdrop click / Esc (Modal handles this)
