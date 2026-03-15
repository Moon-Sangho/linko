# Linko — Component Library

_Written by: /agent-designer | Last updated: 2026-03-15_

For use by `/agent-dev-ui`. Each component includes: location, props interface, visual description, and behavior notes.

---

## Component Map

```
Layout
  AppShell
  Sidebar
  TitleBar

Bookmark
  BookmarkCard
  BookmarkModal (Add / Edit)
  DeleteConfirmPopover
  FaviconImage

Search
  SearchBar
  SearchOverlay
  SearchResultItem

Tag
  TagChip
  TagCombobox
  TagFilterList
  TagManagerPanel

Settings
  SettingsPanel
  SettingsSection

Import
  ImportModal
  ImportProgressBar
  ImportSummary

Primitives
  Button
  Input
  Textarea
  Badge
  EmptyState
  Spinner
  Modal
  Popover
  Kbd
```

---

## Layout Components

### `AppShell`

**File**: `src/renderer/components/layout/AppShell.tsx`

Top-level layout container. Renders the sidebar + main content area.

```tsx
interface AppShellProps {
  children: React.ReactNode; // main content area
}
```

**Layout**: `flex flex-row h-screen w-screen overflow-hidden bg-bg-base`
- Left: `<Sidebar />` (fixed 240px)
- Right: `flex-1 flex-col overflow-hidden`

---

### `Sidebar`

**File**: `src/renderer/components/layout/Sidebar.tsx`

Left navigation panel. Contains tag filters, settings link, version.

```tsx
interface SidebarProps {
  tags: Tag[];
  activeTags: string[];        // array of tag IDs currently active
  totalCount: number;
  onTagClick: (tagId: string) => void;
  onClearTags: () => void;
  onManageTags: () => void;
  onSettingsClick: () => void;
}
```

**Layout**:
- `w-60 flex-shrink-0 flex flex-col bg-bg-surface border-r border-border h-full`
- Header: app name + accent dot
- All Bookmarks row: bold, count badge
- Tags section: scrollable `flex-1` list
- Footer: settings icon + version, `text-xs text-text-tertiary`

**Interactions**:
- Tag row hover: `bg-bg-elevated`
- Active tag: `bg-accent-muted text-accent`
- Multiple tags selected: "Clear" button appears inline in header

---

### `TitleBar`

**File**: `src/renderer/components/layout/TitleBar.tsx`

Custom Electron title bar. macOS-style traffic lights on left; Windows controls on right (platform-detected).

```tsx
interface TitleBarProps {
  title?: string;
}
```

**Notes**:
- Height: 36px
- `-webkit-app-region: drag` on the bar; `no-drag` on any interactive elements
- macOS: leave left padding for system traffic light buttons (`pl-20`)
- Windows: render close/min/max buttons on right using IPC calls

---

## Bookmark Components

### `BookmarkCard`

**File**: `src/renderer/components/bookmark/BookmarkCard.tsx`

Row item in the bookmark list. Contains favicon, title, URL, tags, and hover actions.

```tsx
interface BookmarkCardProps {
  bookmark: Bookmark;
  isSelected: boolean;
  onOpen: (url: string) => void;
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (bookmark: Bookmark) => void;
}
```

**Layout**:
```
┌────────────────────────────────────────────────────────────────┐
│  [favicon]  Title text                         [↗] [✏] [🗑]   │
│             url.com · tag1  tag2               (hover only)    │
└────────────────────────────────────────────────────────────────┘
```

- Height: ~64px; `py-3 px-4`
- Favicon: 16px × 16px, rounded-sm; fallback to `Globe` icon
- Title: `text-md text-text-primary` — single line, truncated
- URL: `text-xs text-text-secondary` — truncated
- Tags: `TagChip` components, `flex-wrap`, max 3 visible + "+N more" badge
- Hover actions: `opacity-0 group-hover:opacity-100 transition-opacity`
- Selected state (keyboard nav): `bg-bg-elevated ring-1 ring-accent`
- Border bottom: `border-b border-border` except last item

**Keyboard**: receives focus; `Enter` opens, `Delete` initiates delete

---

### `BookmarkModal`

**File**: `src/renderer/components/bookmark/BookmarkModal.tsx`

Unified modal for Add and Edit. Controlled by `mode` prop.

```tsx
interface BookmarkModalProps {
  mode: 'add' | 'edit';
  initialValues?: Partial<BookmarkFormValues>;
  existingTags: Tag[];
  onSave: (values: BookmarkFormValues) => Promise<void>;
  onClose: () => void;
}

interface BookmarkFormValues {
  url: string;
  title: string;
  notes: string;
  tagIds: string[];
}
```

**Layout**: `Modal` wrapper at 520px width
- Fields: URL, Title, Notes, Tags (in order)
- URL field auto-focused on open
- Title field: shows spinner during fetch, `isFetching` state
- Tags field: `TagCombobox`
- Footer: `[Cancel]` + `[Save]` right-aligned
- `Save` disabled when URL invalid or empty

**States**:
- `isFetching`: title field disabled with spinner
- `isDuplicateUrl`: warning banner below URL field
- `isSaving`: Save button shows spinner, disabled

---

### `DeleteConfirmPopover`

**File**: `src/renderer/components/bookmark/DeleteConfirmPopover.tsx`

Small popover anchored to delete trigger.

```tsx
interface DeleteConfirmPopoverProps {
  isOpen: boolean;
  anchorRef: React.RefObject<HTMLElement>;
  itemLabel: string;        // e.g. "this bookmark" or "5 bookmarks"
  onConfirm: () => void;
  onCancel: () => void;
}
```

- Width: 240px
- Message: "Delete {itemLabel}? This cannot be undone."
- `[Delete]` button: `variant="danger"`

---

### `FaviconImage`

**File**: `src/renderer/components/bookmark/FaviconImage.tsx`

Favicon with fallback handling.

```tsx
interface FaviconImageProps {
  src?: string;
  alt?: string;
  size?: number; // px, default 16
}
```

- Renders `<img>` if `src` provided
- Falls back to `<Globe />` icon on error or missing src
- `rounded-sm overflow-hidden`

---

## Search Components

### `SearchBar`

**File**: `src/renderer/components/search/SearchBar.tsx`

Main search input, always visible in toolbar.

```tsx
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;      // default: "Search bookmarks…  ⌘F"
}
```

- Full width minus `+` button; height 36px
- Leading `Search` icon; trailing clear `✕` button (visible when value non-empty)
- `bg-bg-elevated border border-border rounded-md`
- Focus: `border-border-focus ring-1 ring-accent/30`
- Keyboard shortcut `Cmd+F` focuses this input (handled in parent)

---

### `SearchOverlay`

**File**: `src/renderer/components/search/SearchOverlay.tsx`

Command-palette style overlay, triggered by `Cmd+K`.

```tsx
interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: (url: string) => void; // opens in browser
}
```

- Rendered into a portal at document root
- Backdrop: `fixed inset-0 bg-black/60 backdrop-blur-sm`
- Panel: `fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl`
  - `bg-bg-surface rounded-xl shadow-lg border border-border`
- Input at top; results list below (`max-h-96 overflow-y-auto`)
- Keyboard: arrow keys navigate; `Enter` opens; `Esc` closes

---

### `SearchResultItem`

**File**: `src/renderer/components/search/SearchResultItem.tsx`

Single result row inside `SearchOverlay`.

```tsx
interface SearchResultItemProps {
  bookmark: Bookmark;
  isActive: boolean;
  onSelect: (url: string) => void;
}
```

- Layout: favicon + title + URL + first tag chip
- Active: `bg-bg-elevated`
- External link icon on right

---

## Tag Components

### `TagChip`

**File**: `src/renderer/components/tag/TagChip.tsx`

Small pill displaying a tag name, optionally removable.

```tsx
interface TagChipProps {
  label: string;
  onRemove?: () => void;   // if provided, shows × button
  size?: 'sm' | 'md';
}
```

- `bg-accent-subtle text-accent text-xs rounded-sm px-2 py-0.5`
- Remove button: `×`, `text-text-secondary hover:text-danger`

---

### `TagCombobox`

**File**: `src/renderer/components/tag/TagCombobox.tsx`

Tag input with type-ahead for add/edit bookmark modal.

```tsx
interface TagComboboxProps {
  selectedTagIds: string[];
  availableTags: Tag[];
  onChange: (tagIds: string[]) => void;
}
```

**Behavior**:
- Renders selected tags as `TagChip` with remove button
- Input at end of chip list
- Typing filters `availableTags` + shows "Create '{query}'" option if no match
- Selecting creates/links the tag
- `Backspace` on empty input removes last chip
- `Escape` closes dropdown

---

### `TagFilterList`

**File**: `src/renderer/components/tag/TagFilterList.tsx`

Sidebar tag list used for filtering the bookmark list.

```tsx
interface TagFilterListProps {
  tags: TagWithCount[];     // Tag + bookmarkCount
  activeTags: string[];
  onTagClick: (tagId: string) => void;
}

interface TagWithCount extends Tag {
  bookmarkCount: number;
}
```

- Scrollable list; each row is `flex items-center justify-between`
- Tag name on left; count badge on right (`text-xs text-text-tertiary`)
- Active row: accent background

---

### `TagManagerPanel`

**File**: `src/renderer/components/tag/TagManagerPanel.tsx`

Full panel for renaming/deleting tags (S-9).

```tsx
interface TagManagerPanelProps {
  tags: TagWithCount[];
  onRename: (tagId: string, newName: string) => Promise<void>;
  onDelete: (tagId: string) => Promise<void>;
  onClose: () => void;
}
```

- Each row: tag name, bookmark count, Rename button, Delete button
- Rename: replaces name label with `Input`; `Enter` saves, `Esc` cancels
- Delete: shows `DeleteConfirmPopover`

---

## Settings & Import Components

### `SettingsPanel`

**File**: `src/renderer/components/settings/SettingsPanel.tsx`

Full-height settings view.

```tsx
interface SettingsPanelProps {
  dbPath: string;
  appVersion: string;
  onChangeDbPath: () => void;
  onImport: () => void;
  onExport: () => void;
  onClose: () => void;
}
```

Contains `SettingsSection` groupings for General, Data, About.

---

### `SettingsSection`

**File**: `src/renderer/components/settings/SettingsSection.tsx`

Visual grouping within settings.

```tsx
interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}
```

- `text-lg font-semibold text-text-secondary mb-3`
- Children in a card-like `bg-bg-surface rounded-lg divide-y divide-border`

---

### `ImportModal`

**File**: `src/renderer/components/import/ImportModal.tsx`

Wizard for file selection → processing → summary.

```tsx
type ImportStep = 'select' | 'processing' | 'summary';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}
```

Manages step state internally. Calls IPC for file picker + import.

---

### `ImportProgressBar`

**File**: `src/renderer/components/import/ImportProgressBar.tsx`

```tsx
interface ImportProgressBarProps {
  current: number;
  total: number;
}
```

- Indeterminate if `total === 0`; determinate otherwise
- `bg-accent rounded-full` fill on `bg-bg-elevated` track

---

### `ImportSummary`

**File**: `src/renderer/components/import/ImportSummary.tsx`

```tsx
interface ImportSummaryProps {
  added: number;
  skipped: number;
  onDone: () => void;
}
```

---

## Primitive Components

### `Button`

**File**: `src/renderer/components/ui/Button.tsx`

```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
}
```

| Variant     | Style                                          |
|-------------|------------------------------------------------|
| `primary`   | `bg-accent text-text-inverse hover:bg-accent-hover` |
| `secondary` | `bg-bg-elevated border border-border text-text-primary` |
| `ghost`     | `text-text-secondary hover:text-text-primary hover:bg-bg-elevated` |
| `danger`    | `bg-danger text-text-inverse hover:opacity-90` |

Sizes: `sm` = 28px tall, `md` = 34px, `lg` = 40px

---

### `Input`

**File**: `src/renderer/components/ui/Input.tsx`

```tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  isLoading?: boolean;
}
```

- `bg-bg-elevated border border-border rounded-md text-sm text-text-primary`
- Focus: `border-border-focus ring-1 ring-accent/20`
- Error: `border-danger` + error message below in `text-xs text-danger`

---

### `Textarea`

**File**: `src/renderer/components/ui/Textarea.tsx`

Same style as `Input` but `<textarea>`. `rows` default 3. Manual resize only.

---

### `Badge`

**File**: `src/renderer/components/ui/Badge.tsx`

Small count or status badge.

```tsx
interface BadgeProps {
  count: number;
  variant?: 'default' | 'accent';
}
```

- `text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center`

---

### `EmptyState`

**File**: `src/renderer/components/ui/EmptyState.tsx`

```tsx
interface EmptyStateProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    shortcut?: string; // e.g. "⌘N"
  };
}
```

- Centered vertically + horizontally in parent
- Icon: 40px, `text-text-tertiary`
- Title: `text-xl font-semibold text-text-primary`
- Description: `text-sm text-text-secondary`
- Action: `Button variant="primary"`

---

### `Spinner`

**File**: `src/renderer/components/ui/Spinner.tsx`

```tsx
interface SpinnerProps {
  size?: 'sm' | 'md'; // 14px | 20px
  className?: string;
}
```

CSS-animated SVG ring. No third-party dependency.

---

### `Modal`

**File**: `src/renderer/components/ui/Modal.tsx`

Primitive modal wrapper used by `BookmarkModal`, `ImportModal`, etc.

```tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  width?: number;          // px, default 520
  children: React.ReactNode;
  footer?: React.ReactNode;
}
```

- Portal rendered; backdrop `bg-black/60`
- Close on backdrop click and `Esc`
- Focus trap inside modal while open

---

### `Popover`

**File**: `src/renderer/components/ui/Popover.tsx`

Small floating panel anchored to a reference element.

```tsx
interface PopoverProps {
  isOpen: boolean;
  anchorRef: React.RefObject<HTMLElement>;
  onClose: () => void;
  placement?: 'bottom-end' | 'bottom-start' | 'top-end';
  children: React.ReactNode;
}
```

- Positioned via `getBoundingClientRect`; adjusts to stay in viewport
- Close on outside click and `Esc`
- `bg-bg-overlay border border-border shadow-md rounded-md p-3`

---

### `Kbd`

**File**: `src/renderer/components/ui/Kbd.tsx`

Keyboard shortcut display element.

```tsx
interface KbdProps {
  children: React.ReactNode; // e.g. "⌘K"
}
```

- `text-xs font-mono bg-bg-elevated border border-border rounded px-1.5 py-0.5 text-text-secondary`
