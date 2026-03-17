# Linko — Component Library (v0.2)

_Written by: /agent-designer | Last updated: 2026-03-17_
_Version: v0.2 — "Organize" release_

> **Note**: v0.1 component specs are preserved in `versions/v0.1/design/components.md`.
> This file documents only new components and props changes for v0.2.

---

## v0.2 Component Changes Overview

```
Modified (props updated):
  BookmarkCard        ← add isSelectMode / isChecked / onCheckToggle
  TagManagerPanel     ← redesigned with TagManagerRow sub-component
  SettingsPanel       ← onExport becomes async, Toast integration
  DeleteConfirmPopover ← updated message format for tag delete

New:
  TagManagerRow       ← single row in TagManagerPanel (display/rename/error states)
  SelectModeToolbar   ← replaces default toolbar in select mode
  BulkDeleteModal     ← confirmation modal for bulk delete
  Toast               ← success/error notification
  ToastContainer      ← toast queue + positioning
  toastStore          ← Zustand store for toast queue
```

---

## Modified Components

### `BookmarkCard` `v0.2`

**File**: `src/renderer/components/bookmark/BookmarkCard.tsx`

Added props for select mode support. Existing props unchanged.

```tsx
interface BookmarkCardProps {
  bookmark: Bookmark;
  isSelected: boolean;          // keyboard nav (unchanged)
  isSelectMode: boolean;        // NEW: select mode active
  isChecked: boolean;           // NEW: checkbox checked state
  onOpen: (url: string) => void;
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (bookmark: Bookmark) => void;
  onCheckToggle: (id: number) => void;  // NEW: checkbox toggle
}
```

**Layout — Select mode** (new):
```
┌────────────────────────────────────────────────────────────────┐
│  [☐]  [favicon]  Title text                        [↗]        │
│       url.com · tag1  tag2                                     │
└────────────────────────────────────────────────────────────────┘
```

- Checkbox: 16px, `accent` when checked; `mr-3`
- `[✏]` and `[🗑]` hidden when `isSelectMode === true`
- Row click in select mode calls `onCheckToggle` instead of `onOpen`
- Checked row: `bg-accent-subtle`
- `Space` key toggles checkbox when card is focused in select mode

---

### `TagManagerPanel` `v0.2`

**File**: `src/renderer/components/tag/TagManagerPanel.tsx`

Redesigned. Now manages rename/delete state and delegates row rendering to `TagManagerRow`.

```tsx
interface TagManagerPanelProps {
  tags: TagWithCount[];
  onRename: (tagId: string, newName: string) => Promise<void>;
  onDelete: (tagId: string) => Promise<void>;
  onClose: () => void;
}
```

**Internal state**:
```tsx
renamingTagId: number | null    // which row is in rename edit mode
deletingTagId: number | null    // which row has delete confirm open
```

- Renders as `<Modal width={480} title="Manage Tags">`
- Body: scrollable list of `<TagManagerRow>` items
- Only one row in rename mode at a time (opening A closes B)
- Empty state: `<EmptyState icon={Tag} title="No tags yet." description="Add one when saving a bookmark." />`

---

### `SettingsPanel` `v0.2`

**File**: `src/renderer/components/settings/SettingsPanel.tsx`

`onExport` is now async to support loading state and toast feedback.

```tsx
interface SettingsPanelProps {
  dbPath: string;
  appVersion: string;
  onChangeDbPath: () => void;
  onImport: () => void;
  onExport: () => Promise<void>;   // changed: now async
  onClose: () => void;
}
```

- Export button: `isLoading` state while `onExport` resolves
- `onExport` in parent calls `bookmark:export-json` IPC → triggers `addToast` from `toastStore`
- Button label: "Export as JSON"; left icon: `Download` (Lucide)

---

## New Components

### `TagManagerRow`

**File**: `src/renderer/components/tag/TagManagerRow.tsx`

Single row inside `TagManagerPanel`. Three visual states: display, rename, rename-error.

```tsx
interface TagManagerRowProps {
  tag: TagWithCount;
  isRenaming: boolean;
  isDeletingConfirmOpen: boolean;
  onRenameStart: () => void;
  onRenameConfirm: (newName: string) => Promise<void>;
  onRenameCancel: () => void;
  onDeleteStart: () => void;
  onDeleteConfirm: () => Promise<void>;
  onDeleteCancel: () => void;
  existingTagNames: string[];   // for duplicate validation (exclude own name)
}
```

**Display state**:
```
┌──────────────────────────────────────────────────────────┐
│  # design          · 12 bookmarks         [✏]  [🗑]     │
└──────────────────────────────────────────────────────────┘
```
- `flex items-center px-4 h-11`
- `#` prefix: `text-xs text-text-tertiary mr-1`
- Tag name: `text-sm font-medium text-text-primary flex-1`
- Count: `text-xs text-text-tertiary mr-4`
- `[✏]`: `Button variant="ghost" size="sm"`, `Pencil` icon 14px
- `[🗑]`: `Button variant="ghost" size="sm"`, `Trash2` icon 14px, `hover:text-danger`

**Rename state**:
```
┌──────────────────────────────────────────────────────────┐
│  # [─ input ────────────────]  · 12 bookmarks  [✓]  [✕] │
└──────────────────────────────────────────────────────────┘
```
- Input: `flex-1`; pre-filled with current name; cursor at end on mount
- `[✓]`: `Button variant="primary" size="sm"`, disabled if unchanged / empty / duplicate
- `[✕]`: `Button variant="ghost" size="sm"`
- `Enter` → confirm; `Esc` → cancel

**Rename error state** (duplicate name):
```
┌──────────────────────────────────────────────────────────┐
│  # [─ input ────────────────]  · 12 bookmarks  [✓]  [✕] │
│    ⚠ "dev" already exists                                │
└──────────────────────────────────────────────────────────┘
```
- Error text: `text-xs text-warning mt-0.5 pl-4` — row expands to show it
- Validation: `existingTagNames.includes(value.trim()) && value.trim() !== tag.name`

**Delete confirm**: `<DeleteConfirmPopover>` anchored to `[🗑]` ref.
- Message: `Remove tag "{name}"? Detaches from N bookmark(s). Bookmarks are not deleted.`
- Confirm label: "Remove"

---

### `SelectModeToolbar`

**File**: `src/renderer/components/bookmark/SelectModeToolbar.tsx`

Replaces the default toolbar (`SearchBar + [+] + [Select]`) when select mode is active.

```tsx
interface SelectModeToolbarProps {
  selectedCount: number;
  totalVisibleCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onDeleteSelected: () => void;
  onCancel: () => void;
}
```

**Layout**:
```
[checkbox]  N selected  ·  [Delete (N)]  [Cancel]
```

- Container: `flex items-center gap-3 px-4 h-11 bg-bg-surface border-b border-border`
- Checkbox (Select All): custom-styled `<input type="checkbox">` with indeterminate support
  - `selectedCount === 0` → unchecked
  - `0 < selectedCount < totalVisibleCount` → indeterminate
  - `selectedCount === totalVisibleCount > 0` → checked
  - Click: unchecked → checked (calls `onSelectAll`); checked/indeterminate → unchecked (calls `onDeselectAll`)
- Count: `text-sm text-text-secondary flex-1`
- `[Delete (N)]`: `Button variant="danger" size="sm"`; disabled when `selectedCount === 0`; label updates live
- `[Cancel]`: `Button variant="ghost" size="sm"`

---

### `BulkDeleteModal`

**File**: `src/renderer/components/bookmark/BulkDeleteModal.tsx`

Confirmation modal for bulk delete. Uses the existing `Modal` primitive.

```tsx
interface BulkDeleteModalProps {
  isOpen: boolean;
  count: number;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}
```

**Layout**:
```
┌────────────────────────────────────────────────┐
│  Delete {count} bookmark(s)?               [✕]  │
├────────────────────────────────────────────────┤
│                                                │
│  This will permanently remove {count}          │
│  bookmark(s). This cannot be undone.           │
│                                                │
│                        [Cancel]  [Delete {N}]  │
└────────────────────────────────────────────────┘
```

- `<Modal width={400}>`
- Title: `Delete ${count} bookmark${count === 1 ? '' : 's'}?`
- `[Delete N]`: `variant="danger"`, shows `isLoading` spinner during deletion
- On success: modal closes, select mode exits, list refreshes

---

### `Toast`

**File**: `src/renderer/components/ui/Toast.tsx`

Single toast notification.

```tsx
type ToastVariant = 'success' | 'error';

interface ToastProps {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  duration?: number;   // ms, default 4000
  onDismiss: (id: string) => void;
}
```

**Visual**:
```
╔══════════════════════════════════════════════╗
║  ✓  Exported 347 bookmarks             [✕]   ║
║     ~/Desktop/linko-export-2026-03-17.json   ║
╚══════════════════════════════════════════════╝
```

- `bg-bg-surface border border-border shadow-lg rounded-lg px-4 py-3`
- `flex items-start gap-3`, min-width 280px, max-width 400px
- Icon: `CheckCircle` (success, `text-success`) or `XCircle` (error, `text-danger`), 16px
- Title: `text-sm font-medium text-text-primary`
- Description: `text-xs text-text-secondary`, max 2 lines, truncated
- `[✕]` dismiss: `ghost`, `X` icon 12px, top-right
- Enter animation: `translateY(8px) → 0` + `opacity 0 → 1`, 150ms `ease-out`
- Auto-dismiss: fade out after `duration` ms

---

### `ToastContainer`

**File**: `src/renderer/components/ui/ToastContainer.tsx`

Manages toast queue. Rendered once at app root.

```tsx
// No props — reads from toastStore
```

- `fixed bottom-4 right-4 z-50 flex flex-col gap-2 items-end`
- Max 3 toasts visible; oldest dismissed when limit exceeded

---

### `toastStore`

**File**: `src/renderer/store/toastStore.ts`

Zustand store for toast queue.

```tsx
interface ToastItem {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastStore {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
}
```

**Usage**:
```tsx
const { addToast } = useToastStore()

// After successful export:
addToast({ variant: 'success', title: 'Exported 347 bookmarks', description: filePath })

// On error:
addToast({ variant: 'error', title: 'Export failed', description: error.message })
```
