# Linko — Screens & Layout (v0.2)

_Written by: /agent-designer | Last updated: 2026-03-17_
_Version: v0.2 — "Organize" release_

> **Note**: v0.1 screens (S-1 ~ S-9) are preserved in `versions/v0.1/design/screens.md`.
> This file documents only new and changed screens for v0.2.

---

## v0.2 Screen Changes

| ID   | Screen                  | Change          |
|------|-------------------------|-----------------|
| S-9  | Tag Manager             | Enhanced (inline rename, counts, improved delete confirm) |
| S-10 | Select Mode (Main View) | New             |
| S-6  | Settings — Export flow  | Export as JSON detail added |

---

## S-9: Tag Manager `v0.2 enhanced`

Opened via "Manage Tags" link in sidebar. Full-height modal, 480px wide.

### Default State

```
┌────────────────────────────────────────────────────────┐
│  Manage Tags                                       [✕]  │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │  # design            · 12 bookmarks  [✏] [🗑]   │  │
│  ├──────────────────────────────────────────────────┤  │
│  │  # dev               · 34 bookmarks  [✏] [🗑]   │  │
│  ├──────────────────────────────────────────────────┤  │
│  │  # reading           ·  8 bookmarks  [✏] [🗑]   │  │
│  ├──────────────────────────────────────────────────┤  │
│  │  # tools             ·  5 bookmarks  [✏] [🗑]   │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Row anatomy**:
- `#` prefix: `text-text-tertiary text-xs`
- Tag name: `text-text-primary text-sm font-medium`
- Count: `· N bookmarks` in `text-text-tertiary text-xs` — right of name, separated by `·`
- `[✏]` Pencil icon button: `ghost` variant, 28px, `text-text-tertiary hover:text-text-primary`
- `[🗑]` Trash icon button: `ghost` variant, 28px, `text-text-tertiary hover:text-danger`
- Row height: 44px; `px-4`; `divide-y divide-border`

### Rename State (inline)

When `[✏]` clicked, the tag name transforms into an editable input in-place:

```
│  # ┌─────────────────────────┐ · 12 bookmarks  [✓] [✕]  │
│    │ design                  │                           │
│    └─────────────────────────┘                          │
```

- Input replaces name text, same width (flex-1)
- `[✓]` save button: `primary` variant, `sm`; enabled only when value changed and non-empty
- `[✕]` cancel button: `ghost` variant, `sm`
- Keyboard: `Enter` saves, `Esc` cancels
- Focus is placed at end of current value on open

**Duplicate name error state**:
```
│  # ┌─────────────────────────┐ · 12 bookmarks  [✓] [✕]  │
│    │ dev                     │                           │
│    └─────────────────────────┘                          │
│      ⚠ "dev" already exists                             │
```
- Error: `text-xs text-warning` below the input row
- `[✓]` save button disabled while error is shown
- Error clears as user edits back to a unique name

### Delete Confirmation

Clicking `[🗑]` shows the `DeleteConfirmPopover` anchored to the trash button:

```
                         ┌───────────────────────────────┐
                         │  Remove tag "design"?          │
                         │  Detaches from 12 bookmarks.   │
                         │  Bookmarks are not deleted.    │
                         │                                │
                         │          [Cancel]  [Remove]    │
                         └───────────────────────────────┘
```

- Popover placement: `bottom-end` from the trash icon
- Message: "Remove tag "{name}"? Detaches from N bookmark(s). Bookmarks are not deleted."
- `[Remove]` button: `danger` variant
- Keyboard: `Enter` to confirm, `Esc` to cancel

### Empty State

When no tags exist:
```
│                                          │
│       [Tag icon, 40px]                   │
│       No tags yet.                       │
│       Add one when saving a bookmark.    │
│                                          │
```

---

## S-6: Settings — Export Detail `v0.2`

The Export section in Settings already existed (v0.1). v0.2 adds the detailed interaction flow.

```
Data
  ─────────────────────────────────────────────
  Import Bookmarks               [Import from HTML]
  Export Bookmarks               [Export as JSON]
```

**Export as JSON — interaction flow**:

1. User clicks `[Export as JSON]`
2. Button shows brief loading state (`isLoading`, Spinner replaces icon)
3. Native file-save dialog opens (handled by main process via IPC):
   - Default filename: `linko-export-YYYY-MM-DD.json`
   - File type filter: `JSON Files (*.json)`
4. On user confirms path → IPC writes file → **success toast** appears:

```
╔══════════════════════════════════════════════╗
║  ✓  Exported 347 bookmarks             [✕]   ║
║     ~/Desktop/linko-export-2026-03-17.json   ║
╚══════════════════════════════════════════════╝
```

5. On user cancels dialog → no action (silent)
6. On write error → **error toast**:

```
╔══════════════════════════════════════════════╗
║  ✕  Export failed                      [✕]   ║
║     Permission denied: ~/Desktop/...         ║
╚══════════════════════════════════════════════╝
```

**Toast spec**:
- Position: `fixed bottom-4 right-4`
- Auto-dismisses after 4 seconds
- `bg-bg-surface border border-border shadow-lg rounded-lg px-4 py-3`
- Success: `✓` in `text-success`; Error: `✕` in `text-danger`
- Two lines: headline (`text-sm font-medium`) + path (`text-xs text-text-secondary`, truncated)

---

## S-10: Select Mode `v0.2 new`

Select Mode is an alternate state of the Main View (S-1), not a separate screen.
The toolbar area transforms; the sidebar remains unchanged.

### Entering Select Mode

Triggered by:
- Toolbar button: `[☐ Select]` — visible in default toolbar, right of `[+]`
- Keyboard: `Cmd+Shift+X`

### Layout — Select Mode Active

```
┌─────────────────────────────────────────────────────────────────┐
│ TitleBar                                             [─][□][✕]  │
├──────────────────┬──────────────────────────────────────────────┤
│                  │  ┌──────────────────────────────────────────┐ │
│  SIDEBAR         │  │ [─ Select All]  3 selected  [Delete (3)] [Cancel] │
│  (unchanged)     │  └──────────────────────────────────────────┘ │
│                  │                                              │
│                  │  ──────────────────────────────────────────  │
│                  │  [☐] [favicon] Title text           [↗]     │
│                  │  [☑] [favicon] Title text           [↗]     │
│                  │  [☑] [favicon] Title text           [↗]     │
│                  │  [☐] [favicon] Title text           [↗]     │
│                  │  ...                                        │
└──────────────────┴──────────────────────────────────────────────┘
```

### Select Mode Toolbar

Replaces the default `[SearchBar] [+] [Select]` toolbar when active:

| Element | Description |
|---------|-------------|
| Checkbox (Select All) | Indeterminate (─) when partial; checked (☑) when all; unchecked (☐) when none |
| Count label | `"N selected"` — `text-sm text-text-secondary`; `flex-1` |
| `[Delete (N)]` | `danger` variant, `sm`. Disabled when `N === 0`. Count in parentheses updates live. |
| `[Cancel]` | `ghost` variant. Exits select mode, clears selections. |

### BookmarkCard — Select Mode State

```
┌────────────────────────────────────────────────────────────────┐
│ [☐]  [favicon]  Title text                          [↗]        │
│      url.com · tag1  tag2                                      │
└────────────────────────────────────────────────────────────────┘
```

- Checkbox: left-most, 16px, `accent` color when checked
- Row click (anywhere except `[↗]`) toggles the checkbox
- `[✏]` and `[🗑]` hover actions hidden in select mode
- `[↗]` open-in-browser remains visible
- Checked row: `bg-accent-subtle` background tint

### Bulk Delete Confirmation Modal

When `[Delete (N)]` clicked, a centered modal (not popover — large destructive action):

```
┌────────────────────────────────────────────────┐
│  Delete 3 bookmarks?                       [✕]  │
├────────────────────────────────────────────────┤
│                                                │
│  This will permanently remove 3 bookmarks.    │
│  This action cannot be undone.                 │
│                                                │
│                        [Cancel]  [Delete 3]    │
└────────────────────────────────────────────────┘
```

- Modal width: 400px
- `[Delete N]` button: `danger` variant
- After confirmation: items removed, select mode exits automatically
- `Esc` or `[✕]` cancels without deleting

### Select Mode — Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Esc` | Exit select mode, clear selections |
| `Cmd+A` | Select All (within current filter/search) |
| `Space` | Toggle selection on focused card |
| `Delete` / `Backspace` | Open bulk delete confirmation if ≥1 selected |
