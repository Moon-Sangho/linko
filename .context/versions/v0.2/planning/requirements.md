# Linko — Feature Requirements

_Written by: /agent-pm | Last updated: 2026-03-13_

---

## 1. Product Vision

Linko is a local-first desktop bookmark manager for power users who want fast, distraction-free bookmark management without relying on a browser or cloud service. All data lives on the user's machine by default.

---

## 2. Core Principles

- **Local-first**: works fully offline; no server required for core features
- **Fast**: instant search, no loading spinners for local operations
- **Distraction-free**: minimal UI, keyboard-friendly
- **Extensible**: architecture must allow future login-based sync (RemoteRepository)

---

## 3. Functional Requirements

### 3.1 Bookmark Management

| ID   | Requirement | Priority |
|------|-------------|----------|
| BM-1 | Add a bookmark by entering a URL | Must |
| BM-2 | Edit a bookmark's URL, title, and notes | Must |
| BM-3 | Delete a bookmark (with confirmation) | Must |
| BM-4 | View a list of all bookmarks | Must |
| BM-5 | Open a bookmark in the default browser | Must |
| BM-6 | Auto-fetch page title and favicon on add | Should |
| BM-7 | Detect and warn on duplicate URLs | Should |
| BM-8 | Bulk delete bookmarks | Could |

### 3.2 Tagging & Organization

| ID   | Requirement | Priority |
|------|-------------|----------|
| TG-1 | Assign one or more tags to a bookmark | Must |
| TG-2 | Create and delete tags | Must |
| TG-3 | Filter bookmark list by tag(s) | Must |
| TG-4 | Rename a tag (applies across all bookmarks) | Should |
| TG-5 | View all tags with bookmark counts | Should |

### 3.3 Search

| ID   | Requirement | Priority |
|------|-------------|----------|
| SR-1 | Full-text search across URL, title, and notes | Must |
| SR-2 | Filter by tag combined with text search | Must |
| SR-3 | Search results update instantly (no submit required) | Must |
| SR-4 | Keyboard shortcut to focus search bar | Should |

### 3.4 Import

| ID   | Requirement | Priority |
|------|-------------|----------|
| IM-1 | Import bookmarks from a browser-exported HTML file | Must |
| IM-2 | Show import summary (added / skipped duplicates) | Should |
| IM-3 | Import from JSON export (Linko format) | Could |

### 3.5 Export

| ID   | Requirement | Priority |
|------|-------------|----------|
| EX-1 | Export all bookmarks as JSON | Should |
| EX-2 | Export all bookmarks as browser-compatible HTML | Could |

### 3.6 Settings

| ID   | Requirement | Priority |
|------|-------------|----------|
| ST-1 | Choose where the SQLite database file is stored | Should |
| ST-2 | Display app version | Must |
| ST-3 | Trigger manual database backup | Could |

---

## 4. Non-Functional Requirements

| ID    | Requirement |
|-------|-------------|
| NF-1  | App launches in under 2 seconds on modern hardware |
| NF-2  | Search returns results in under 100ms for up to 10,000 bookmarks |
| NF-3  | UI thread never blocked by SQLite operations (use async IPC) |
| NF-4  | All IPC calls validated on the main process; renderer is untrusted |
| NF-5  | Electron contextIsolation enabled; no nodeIntegration in renderer |
| NF-6  | Supports macOS 12+ |
| NF-7  | App bundle under 150MB |

---

## 5. Data Model (high-level)

```
Bookmark
  id          INTEGER PRIMARY KEY
  url         TEXT NOT NULL UNIQUE
  title       TEXT
  notes       TEXT
  favicon_url TEXT
  created_at  DATETIME
  updated_at  DATETIME

Tag
  id    INTEGER PRIMARY KEY
  name  TEXT NOT NULL UNIQUE

BookmarkTag (junction)
  bookmark_id INTEGER FK
  tag_id      INTEGER FK
```

---

## 6. IPC Architecture Constraint

All data access from the renderer must go through IPC handlers in the main process. The renderer never touches SQLite directly. This ensures the LocalRepository → RemoteRepository swap can happen transparently.

---

## 7. Future Requirements (out of MVP scope)

- User accounts and authentication
- Cloud sync via RemoteRepository
- Bookmark sharing / collections
- Browser extension companion
- Mobile app companion
