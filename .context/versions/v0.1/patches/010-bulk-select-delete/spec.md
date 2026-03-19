# Patch 010 — bulk-select-delete

**Date:** 2026-03-19
**Agents involved:** Designer, Orchestrate, Dev UI

## Problem

No way to delete multiple bookmarks at once. Users had to delete bookmarks one by one via the inline confirm flow.

## Decision

- Add per-item checkbox (visible on hover, always visible in selection mode)
- Entering selection mode (any checkbox checked) shows a `BulkActionBar` sticky at the bottom of the list
- Bulk delete requires confirmation via `BulkDeleteModal`
- Selection state lives in `useUIStore`; bulk IPC calls reuse existing `BOOKMARK_DELETE` in parallel
- Left border accent (`border-l-2`) always reserved (transparent by default) to prevent layout shift on check
- Tag position in `BookmarkItem` already reflects prior change (inline-left of title); design docs updated accordingly

## Changes

### `src/renderer/store/useUIStore.ts`
- Added `selectedBookmarkIds: number[]` and actions: `toggleBookmarkSelection`, `selectAllBookmarks`, `clearSelection`

### `src/renderer/store/useBookmarkStore.ts`
- Added `removeBulk(ids)`: optimistic local remove → `Promise.all(BOOKMARK_DELETE)` → `fetchAll` on error
- Fixed `../../shared/` relative imports to `@shared/` aliases

### `src/renderer/components/bookmark/BookmarkItem.tsx`
- Added `isChecked`, `isSelectionMode`, `onCheckToggle` props
- Checkbox button rendered left of favicon; `onDoubleClick` stops propagation to prevent URL open on double-click
- Hover actions hidden when `isSelectionMode` is true
- `border-l-2 border-l-transparent` always applied to prevent layout shift; color changes to accent only when `isChecked`
- Removed accent border from `isSelected` (single-click nav) state — background highlight only

### `src/renderer/components/bookmark/BulkActionBar.tsx`
- New component: sticky bottom bar with select-all checkbox (supports indeterminate), selected count, Delete and Clear buttons

### `src/renderer/components/bookmark/BulkDeleteModal.tsx`
- New component: confirmation modal (400px) using existing `Modal` primitive

### `src/renderer/components/bookmark/BookmarkList.tsx`
- Wires selection state from `useUIStore` and `removeBulk` from `useBookmarkStore`
- Keyboard shortcuts: `⌘A` select all visible, `Esc` clear selection, `⌘⌫` open delete modal
- Renders `BulkActionBar` (when selection active) and `BulkDeleteModal`

### `src/renderer/index.css`
- Added `.scrollbar-thin` utility for visible scrollbar on bookmark list and tag sidebar

### `src/renderer/components/layout/AppShell.tsx`
- Added `flex flex-col` to `<main>` so `BookmarkList`'s `flex-1` is bounded and `overflow-y-auto` works

### `.context/versions/v0.1/design/components.md`
- Updated `BookmarkCard` layout diagram and description: tags are inline-left of title (not below URL)
