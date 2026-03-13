# Linko — User Stories & Acceptance Criteria

_Written by: /agent-pm | Last updated: 2026-03-13_

---

## Epic 1: Bookmark Management

### US-01 — Add a bookmark

> As a user, I want to add a new bookmark by entering a URL so that I can save pages I want to revisit.

**Acceptance Criteria:**
- [ ] I can open an "Add Bookmark" dialog/panel from the main view
- [ ] I can enter a URL and save it
- [ ] If the URL is a duplicate, I see a warning and am not forced to save
- [ ] After saving, the bookmark appears in the list immediately
- [ ] The title is auto-fetched from the page (non-blocking; shows URL as fallback while fetching)
- [ ] Invalid URLs (no protocol, malformed) are rejected with an inline error

---

### US-02 — Edit a bookmark

> As a user, I want to edit a bookmark's title, URL, and notes so that I can keep it accurate over time.

**Acceptance Criteria:**
- [ ] I can open an edit panel from the bookmark list
- [ ] I can change the URL, title, and notes fields independently
- [ ] Saving updates the record instantly in the list
- [ ] Editing the URL to an existing bookmark URL shows a duplicate warning

---

### US-03 — Delete a bookmark

> As a user, I want to delete a bookmark so that my list stays relevant.

**Acceptance Criteria:**
- [ ] A delete action is available on each bookmark (e.g., hover action or right-click)
- [ ] I see a confirmation prompt before deletion
- [ ] After confirmation, the bookmark is removed from the list immediately

---

### US-04 — Open a bookmark

> As a user, I want to open a bookmark in my default browser so that I can visit the page without copy-pasting.

**Acceptance Criteria:**
- [ ] Clicking the bookmark (or a dedicated "open" button) opens the URL in the default browser
- [ ] A keyboard shortcut triggers the same action when a bookmark is focused

---

## Epic 2: Tagging & Organization

### US-05 — Tag a bookmark

> As a user, I want to assign tags to bookmarks so that I can group related pages.

**Acceptance Criteria:**
- [ ] I can add one or more tags when creating or editing a bookmark
- [ ] I can type to create a new tag or select an existing one
- [ ] Tags are displayed on the bookmark card in the list
- [ ] I can remove a tag from a bookmark without deleting the tag globally

---

### US-06 — Filter by tag

> As a user, I want to filter the bookmark list by tag so that I see only relevant bookmarks.

**Acceptance Criteria:**
- [ ] A tag list/sidebar shows all existing tags
- [ ] Clicking a tag filters the bookmark list to only tagged bookmarks
- [ ] I can select multiple tags (AND or OR — default: OR)
- [ ] The active filter is clearly indicated; I can clear it with one click

---

### US-07 — Manage tags

> As a user, I want to rename and delete tags so that I can keep my taxonomy clean.

**Acceptance Criteria:**
- [ ] I can rename a tag; all bookmarks using it are updated
- [ ] I can delete a tag; the tag is removed from all bookmarks (bookmarks are not deleted)
- [ ] Tag deletion requires confirmation

---

## Epic 3: Search

### US-08 — Search bookmarks

> As a user, I want to search my bookmarks by keyword so that I can find a specific page quickly.

**Acceptance Criteria:**
- [ ] A search input is always visible in the main view
- [ ] Results update as I type (debounced, ≤150ms)
- [ ] Search matches against URL, title, and notes
- [ ] No results shows a helpful empty state (not a blank screen)
- [ ] A keyboard shortcut (e.g., Cmd+F) focuses the search input

---

### US-09 — Combined search + tag filter

> As a user, I want to search by keyword while a tag filter is active so that I can narrow results precisely.

**Acceptance Criteria:**
- [ ] When a tag filter is active, search operates within that filtered set
- [ ] Clearing the search preserves the active tag filter
- [ ] Clearing the tag filter preserves the current search text

---

## Epic 4: Import

### US-10 — Import from browser HTML export

> As a user, I want to import bookmarks from a browser-exported HTML file so that I can migrate my existing collection to Linko.

**Acceptance Criteria:**
- [ ] I can trigger "Import" from a menu or settings
- [ ] A file picker opens filtered to `.html` files
- [ ] Linko parses the Netscape Bookmark Format and creates bookmarks
- [ ] A summary dialog shows: X added, Y skipped (duplicates)
- [ ] Import does not block the UI; progress is shown for large files

---

## Epic 5: Export

### US-11 — Export bookmarks as JSON

> As a user, I want to export my bookmarks as JSON so that I can back them up or move to another app.

**Acceptance Criteria:**
- [ ] Export option is accessible from settings or a menu
- [ ] A file save dialog lets me choose the destination
- [ ] The exported JSON includes all bookmark fields and tags
- [ ] I get a success confirmation when export is complete

---

## Epic 6: App / Settings

### US-12 — View app version

> As a user, I want to see the app version so that I know what release I'm running.

**Acceptance Criteria:**
- [ ] App version is visible in the About section or settings page

---

### US-13 — Configure database location

> As a power user, I want to choose where my SQLite database file is stored so that I can keep it in my synced folder (e.g., Dropbox).

**Acceptance Criteria:**
- [ ] A setting allows me to pick a custom folder for the database file
- [ ] Changing the path migrates (copies) the existing database to the new location
- [ ] The app restarts or reloads after the path change
- [ ] The current database path is always displayed

---

## Priority Order

| Priority | Epic | Stories |
|----------|------|---------|
| P0 — MVP | Bookmark Management | US-01, 02, 03, 04 |
| P0 — MVP | Search | US-08 |
| P0 — MVP | Tagging | US-05, 06 |
| P1 — MVP+ | Import | US-10 |
| P1 — MVP+ | Tagging | US-07 |
| P1 — MVP+ | Search | US-09 |
| P2 — Post-MVP | Export | US-11 |
| P2 — Post-MVP | Settings | US-13 |
| P3 — Always | App meta | US-12 |
