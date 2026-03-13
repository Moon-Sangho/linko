# Linko — MVP Scope

_Written by: /agent-pm | Last updated: 2026-03-13_

---

## MVP Definition

The MVP ships a fully working local bookmark manager that covers the daily workflow of saving, organizing, and retrieving bookmarks — with no cloud dependency.

**Guiding rule**: if a feature requires a network call or a server, it is post-MVP.

---

## MVP Feature List

| Feature | Requirement IDs | User Stories | Notes |
|---------|----------------|--------------|-------|
| Add bookmark | BM-1, BM-6, BM-7 | US-01 | Auto-fetch title; duplicate warning |
| Edit bookmark | BM-2 | US-02 | URL, title, notes |
| Delete bookmark | BM-3 | US-03 | With confirmation |
| Open in browser | BM-5 | US-04 | Default browser via shell.openExternal |
| Tags — assign | TG-1, TG-2 | US-05 | Create tag on-the-fly |
| Tags — filter | TG-3 | US-06 | Multi-tag OR filter |
| Search | SR-1, SR-2, SR-3, SR-4 | US-08, US-09 | Instant, full-text |
| Import HTML | IM-1, IM-2 | US-10 | Netscape Bookmark Format |
| App version display | ST-2 | US-12 | In About / settings |

---

## MVP+ (v1.1 target)

Features deferred from MVP but planned for the first minor release.

| Feature | Requirement IDs | Reason for deferral |
|---------|----------------|---------------------|
| Tag rename / delete | TG-4, TG-5 | Nice-to-have; won't block launch |
| Export JSON | EX-1 | Useful but not blocking |
| Duplicate detection (hard block) | BM-7 | Warning only in MVP |
| Bulk delete | BM-8 | Quality-of-life |

---

## Post-MVP / Future

Features intentionally out of scope until architecture supports them.

| Feature | Reason |
|---------|--------|
| User login / auth | Requires RemoteRepository implementation |
| Cloud sync | Requires backend infrastructure |
| Bookmark sharing | Requires accounts |
| Browser extension | Separate product surface |
| JSON import | Low demand vs HTML import |
| HTML export | Post-MVP |
| Custom DB location | Power-user; not core |
| Mobile companion | Separate platform |

---

## Architecture Decisions for Extensibility

These decisions are made now to avoid painful refactors later:

1. **Repository interface** — `BookmarkRepository` interface defined in `src/shared/`. `LocalRepository` implements it. `RemoteRepository` can be dropped in later.

2. **IPC-only data access** — Renderer never imports SQLite. All data flows through typed IPC channels. This means swapping storage is invisible to the UI.

3. **Typed IPC channels** — All channel names and payload shapes live in `src/shared/ipc-channels.ts`. Prevents string typos and makes the surface area auditable.

4. **No auth coupling** — MVP data model has no `user_id` column. Adding it later is a migration, not a redesign.

---

## Success Criteria for MVP

- User can add, edit, delete, and open a bookmark within 30 seconds of first launch
- User can tag bookmarks and filter by tag
- User can find any bookmark in under 5 keystrokes via search
- User can import 500+ bookmarks from a Chrome HTML export without errors
- App is packaged and installable on macOS (DMG) and Windows (NSIS)

---

## Next Steps for Agents

| Agent | Action |
|-------|--------|
| `/agent-designer` | Read `requirements.md` + `user-stories.md`, then design screens and component system |
| `/agent-dev-core` | Read `requirements.md` + `mvp-scope.md`, scaffold main process, DB schema, IPC handlers |
| `/agent-dev-ui` | Wait for designer output, then build React components against IPC API |
| `/agent-dev-qa` | Read all outputs to define QA checklist and build pipeline |
