# Linko — User Stories & Acceptance Criteria

_Written by: /agent-pm | Last updated: 2026-03-17_
_Version: v0.2 — "Organize" release_

> **Note**: This file extends v0.1 stories. v0.1 stories (US-01 ~ US-13) are preserved in
> `versions/v0.1/planning/user-stories.md`. Only v0.2 additions are documented here.

---

## v0.2 Scope: Must Have Features

| Story | Feature | Requirement IDs |
|-------|---------|----------------|
| US-07 | Tag management (rename, delete, counts) | TG-4, TG-5 |
| US-11 | Export bookmarks as JSON | EX-1 |
| US-14 | Bulk delete bookmarks | BM-8 |

---

## Epic 2: Tagging & Organization

### US-07 — Manage tags `v0.2`

> As a user, I want to rename and delete tags, and see how many bookmarks use each tag, so that I can keep my taxonomy clean.

**Acceptance Criteria:**
- [ ] The tag list/sidebar shows a bookmark count next to each tag name (e.g., "design · 12")
- [ ] I can rename a tag inline (edit icon); all bookmarks using it reflect the new name immediately
- [ ] I can delete a tag via a delete icon on the tag item
- [ ] Deleting a tag shows a confirmation prompt: "Remove tag '{name}'? This will detach it from X bookmarks."
- [ ] After deletion, the tag is removed from all associated bookmarks; the bookmarks themselves are not deleted
- [ ] Renaming a tag to an existing tag name shows an inline error and does not save
- [ ] Changes to tags update the tag filter panel without a full page reload

---

## Epic 1: Bookmark Management

### US-14 — Bulk delete bookmarks `v0.2`

> As a user, I want to select multiple bookmarks and delete them at once so that I can clean up a large import efficiently.

**Acceptance Criteria:**
- [ ] A "Select" mode can be toggled from the toolbar (or via keyboard shortcut `Cmd+Shift+X`)
- [ ] While in select mode, each bookmark card shows a checkbox
- [ ] I can select individual bookmarks by clicking their checkbox
- [ ] "Select All" selects all bookmarks currently visible (respects active search/tag filter)
- [ ] The toolbar shows a count of selected items: "3 selected"
- [ ] A "Delete Selected" button appears in the toolbar when ≥1 bookmark is selected
- [ ] Clicking "Delete Selected" shows a confirmation dialog: "Delete 3 bookmarks? This cannot be undone."
- [ ] After confirmation, all selected bookmarks are removed from the list immediately
- [ ] Exiting select mode (Escape or toggle button) clears all selections without deleting
- [ ] Bulk delete is disabled (button grayed out) when 0 items are selected

---

## Epic 5: Export

### US-11 — Export bookmarks as JSON `v0.2`

> As a user, I want to export my bookmarks as a JSON file so that I can back them up or migrate to another app.

**Acceptance Criteria:**
- [ ] "Export as JSON" option is accessible from the settings panel
- [ ] A native file-save dialog opens; default filename is `linko-export-YYYY-MM-DD.json`
- [ ] The exported JSON is an array of bookmark objects, each including: `id`, `url`, `title`, `notes`, `favicon_url`, `tags` (array of tag names), `created_at`, `updated_at`
- [ ] Export includes all bookmarks regardless of active filters
- [ ] A toast/notification confirms success: "Exported N bookmarks to {path}"
- [ ] On failure (e.g., permission denied), an error message is shown with the reason
- [ ] The exported file is valid JSON (parseable by `JSON.parse`)

---

## Priority Order (v0.2 only)

| Priority | Epic | Stories |
|----------|------|---------|
| P0 — v0.2 Must | Tagging | US-07 |
| P0 — v0.2 Must | Bookmark Management | US-14 |
| P0 — v0.2 Must | Export | US-11 |
