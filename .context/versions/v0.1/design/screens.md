# Linko — Screens & Layout

_Written by: /agent-designer | Last updated: 2026-03-15_

---

## Screen Overview

| ID  | Screen                | Route / Trigger        | Priority |
|-----|-----------------------|------------------------|----------|
| S-1 | Main View             | App launch             | P0       |
| S-2 | Add Bookmark Modal    | `+` button / `Cmd+N`   | P0       |
| S-3 | Edit Bookmark Modal   | Edit action on card    | P0       |
| S-4 | Delete Confirmation   | Delete action          | P0       |
| S-5 | Search Overlay        | `Cmd+K`                | P0       |
| S-6 | Settings              | Gear icon / `Cmd+,`    | P1       |
| S-7 | Import Wizard         | Import from Settings   | P1       |
| S-8 | Import Summary        | After import completes | P1       |
| S-9 | Tag Manager           | "Manage Tags" in panel | P1       |

---

## S-1: Main View

The primary screen. Visible at all times. Never navigated away from — modals overlay it.

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ TitleBar (Electron custom, drag region)              [─][□][✕] │
├──────────────────┬──────────────────────────────────────────────┤
│                  │  ┌──────────────────────────────────────┐    │
│   SIDEBAR        │  │  Search Bar                    [+]   │    │
│   240px fixed    │  └──────────────────────────────────────┘    │
│                  │                                              │
│  [All Bookmarks] │  Bookmark List                              │
│                  │  ─────────────────────────────────────────  │
│  Tags            │  [Card] [Card] [Card]                       │
│  ─────────────   │  [Card] [Card] [Card]                       │
│  # design (12)   │  [Card] ...                                 │
│  # dev (34)      │                                              │
│  # reading (8)   │                                              │
│  # tools (5)     │                                              │
│  ...             │                                              │
│                  │                                              │
│  [Manage Tags]   │                                              │
│                  │                                              │
├──────────────────┤                                              │
│  [⚙ Settings]   │                                              │
│  v0.1.0          │                                              │
└──────────────────┴──────────────────────────────────────────────┘
```

### Sidebar (240px, fixed)

- **Header**: App name "Linko" in `text-lg` + accent color dot
- **All Bookmarks**: Default selected state; shows total count badge
- **Tags section**: Scrollable list of tags with bookmark count
  - Active tag: accent background, accent text
  - Multiple selection supported (Cmd+click or Shift+click)
  - "Clear filter" appears when tag(s) selected
- **Manage Tags**: subtle text link at bottom of tag list
- **Footer**: Settings gear icon + version string

### Main Area

- **Toolbar**: Search bar (full width minus `+` button). Always visible.
- **Bookmark List**: Vertical list of `BookmarkCard` items
  - Sort order: newest first (default)
  - Virtualized for performance (react-window or similar)
- **Empty State**: Shows when no bookmarks match filter/search

### Keyboard Shortcuts (visible on screen)

| Action              | Shortcut |
|---------------------|----------|
| Add bookmark        | `Cmd+N`  |
| Focus search        | `Cmd+F`  |
| Quick search overlay| `Cmd+K`  |
| Open selected       | `Enter`  |
| Delete selected     | `Backspace` / `Delete` |
| Settings            | `Cmd+,`  |

---

## S-2: Add Bookmark Modal

Triggered by `+` button or `Cmd+N`. Overlays the main view with a backdrop.

### Layout

```
┌───────────────────────────────────────────┐
│  Add Bookmark                          [✕] │
├───────────────────────────────────────────┤
│                                           │
│  URL *                                    │
│  ┌─────────────────────────────────────┐  │
│  │ https://...                         │  │
│  └─────────────────────────────────────┘  │
│  [⚠ Duplicate URL — already saved]       │  (conditional)
│                                           │
│  Title                                    │
│  ┌─────────────────────────────────────┐  │
│  │ Fetching...               [spinner] │  │  (auto-fetching state)
│  └─────────────────────────────────────┘  │
│                                           │
│  Notes                                    │
│  ┌─────────────────────────────────────┐  │
│  │                                     │  │
│  │                                     │  │
│  └─────────────────────────────────────┘  │
│                                           │
│  Tags                                     │
│  ┌─────────────────────────────────────┐  │
│  │ [design ✕]  [dev ✕]  add tag...    │  │
│  └─────────────────────────────────────┘  │
│  (dropdown appears while typing)          │
│                                           │
│                    [Cancel]  [Save]       │
└───────────────────────────────────────────┘
```

### Behavior

- Modal width: 520px, centered
- URL field focused on open
- Title auto-fetches when URL loses focus (valid URL only)
- Title shows URL as placeholder while fetching; editable at any time
- Tags input: inline combobox — type to filter existing tags or create new
- Duplicate warning: inline below URL field (not blocking save)
- Invalid URL: inline error, Save button disabled
- `Esc` or `[✕]` closes without saving
- `Enter` in URL field moves to Title; `Tab` through fields; `Cmd+Enter` saves

---

## S-3: Edit Bookmark Modal

Same visual structure as Add Bookmark. Differences:

- Header: "Edit Bookmark"
- All fields pre-populated
- URL change triggers duplicate check
- No auto-fetch spinner (title already saved)
- "Fetch title" button available if user wants to refresh

---

## S-4: Delete Confirmation

Inline popover (not a full modal). Appears anchored to the delete button.

```
┌────────────────────────────────┐
│  Delete this bookmark?         │
│  This action cannot be undone. │
│                                │
│          [Cancel]  [Delete]    │
└────────────────────────────────┘
```

- Width: 240px
- `Delete` button: danger color
- Keyboard: `Enter` to confirm, `Esc` to cancel
- For bulk delete: full modal with count ("Delete 5 bookmarks?")

---

## S-5: Search Overlay

Triggered by `Cmd+K`. Full-width command-palette style overlay, centered, floating.

```
┌────────────────────────────────────────────────────┐
│  🔍  Search bookmarks...                           │
├────────────────────────────────────────────────────┤
│  Linear — Linear: Plan and build products          │
│  https://linear.app                    [↗] #tools  │
├────────────────────────────────────────────────────┤
│  Raycast — Supercharged productivity tool          │
│  https://raycast.com                   [↗] #tools  │
├────────────────────────────────────────────────────┤
│  (Empty state: "No bookmarks match…")              │
└────────────────────────────────────────────────────┘
```

### Behavior

- Overlay: max-width 640px, centered horizontally, appears 20% from top
- Semi-transparent backdrop, blurred
- Results update as user types (debounced 100ms)
- Arrow keys navigate results; `Enter` opens in browser; `Esc` closes
- Result shows: favicon, title, URL, first tag chip
- Click result opens bookmark in browser and closes overlay

---

## S-6: Settings

Accessed via gear icon in sidebar footer. Pushes the main view (or opens as a modal page — preference: slide-in panel from right, full height).

### Sections

```
Settings
━━━━━━━━━━━━━━━━━━━━━━━━━━━

General
  ─────────────────────────────────
  Database Location
  /Users/moon/Library/Application Support/Linko/linko.db
  [Change Location]

Data
  ─────────────────────────────────
  Import Bookmarks          [Import from HTML]
  Export Bookmarks          [Export as JSON]

About
  ─────────────────────────────────
  Linko
  Version 0.1.0
  Built with Electron, React, SQLite
```

- Full-height panel, 480px wide, right-anchored or centered
- Each section is a card-like grouping with `text-lg` label
- Settings actions are buttons, not toggles (for MVP)

---

## S-7: Import Wizard

Triggered from Settings → "Import from HTML".

### Step 1: File Selection

```
┌──────────────────────────────────────────┐
│  Import Bookmarks                     [✕] │
├──────────────────────────────────────────┤
│                                          │
│     ┌──────────────────────────────┐     │
│     │                              │     │
│     │   [↑]  Drop HTML file here   │     │
│     │       or  [Choose File]      │     │
│     │                              │     │
│     └──────────────────────────────┘     │
│                                          │
│  Supports browser-exported HTML files    │
│  (Chrome, Firefox, Safari, Edge)         │
│                                          │
│                             [Cancel]     │
└──────────────────────────────────────────┘
```

### Step 2: Processing (progress)

```
┌──────────────────────────────────────────┐
│  Importing...                            │
├──────────────────────────────────────────┤
│                                          │
│  Parsing bookmarks.html                  │
│  ████████████████░░░░  847 / 1,203       │
│                                          │
└──────────────────────────────────────────┘
```

- Modal, non-dismissible during processing
- Progress bar with count

---

## S-8: Import Summary

Shown after import completes (replaces processing state).

```
┌──────────────────────────────────────────┐
│  Import Complete                      [✕] │
├──────────────────────────────────────────┤
│                                          │
│   ✓  1,056  bookmarks added             │
│   ─   147  skipped (duplicates)         │
│                                          │
│                              [Done]      │
└──────────────────────────────────────────┘
```

---

## S-9: Tag Manager

Opened via "Manage Tags" link in sidebar. Slide-in panel or modal.

```
┌──────────────────────────────────────────┐
│  Manage Tags                          [✕] │
├──────────────────────────────────────────┤
│                                          │
│  design          12 bookmarks  [Rename] [Delete] │
│  dev             34 bookmarks  [Rename] [Delete] │
│  reading          8 bookmarks  [Rename] [Delete] │
│  tools            5 bookmarks  [Rename] [Delete] │
│                                          │
│  (empty state: "No tags yet.")           │
└──────────────────────────────────────────┘
```

- Inline rename: clicking "Rename" replaces label with an input
- Delete: triggers confirmation popover (same as S-4 pattern)

---

## Empty States

| Context                | Illustration | Message                              |
|------------------------|-------------|--------------------------------------|
| No bookmarks at all    | `Bookmark` icon, large | "No bookmarks yet. Press Cmd+N to add your first." |
| No search results      | `Search` icon | "No results for "{query}". Try a different keyword." |
| No bookmarks for tag   | `Tag` icon  | "No bookmarks tagged "{tag}" yet."  |
| No tags                | `Tag` icon  | "No tags yet. Add one when saving a bookmark." |
