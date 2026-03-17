# Patch 001 — v0.1 Spec Gaps & Implementation Issues

**Date:** 2026-03-15
**Agents involved:** Dev Core, Dev UI

## Problem

After the initial v0.1 implementation, a sweep of the codebase revealed several gaps
between the spec and the actual behavior, plus a handful of runtime bugs caught before
any user testing.

## Changes

### Build
- Add `@shared` alias to `electron.vite.config.ts` for all three build targets (main, preload, renderer)

### Database & Repository
- Enable `foreign_keys` PRAGMA (was silently not applied via `exec()`)
- Add WAL journal mode for better write concurrency
- Add orphaned tag cleanup on DB init
- Add explicit `bookmark_tags` deletion before CASCADE in bookmark-repository

### Renderer Components
- **BookmarkItem**: Replace absolute-positioned delete popover with inline confirm UI
  (was clipped by overflow containers)
- **BookmarkItem**: Move tags to left of title; hide date row while deleting
- **AddBookmarkModal**: Always fetch metadata for favicon (previously only when title missing)
- **AddBookmarkModal / EditBookmarkModal**: Add inline tag creation UI
- **Sidebar**: Add browser bookmark import button
- **TitleBar**: Display app version
- **CommandPalette**: Fix `openUrl` call — was passing `bookmark.id` instead of `url`
- **Input**: Convert to `forwardRef` to accept `ref` prop

### State Management
- `useBookmarkStore`: Switch to `(set, get)` for synchronous access; use
  `useTagStore.setState()` for synchronous orphan tag removal on delete/update
- `useUIStore`: Change tag filter from multi-select to single-select (radio)
- `useBookmarkForm`: Add `cancel()` to stop in-flight metadata fetches;
  remove `isFetchingMeta` from `canSave` gate

### Search & List
- Move `useSearch()` from `App.tsx` into `BookmarkList` for proper result isolation
- Add "No results" empty state; derive `displayBookmarks` from search/filter state
- Remove redundant `fetchAll()` `useEffect` from `App`

### Styling
- Add overflow containment and spacing utilities to `index.css`
- Fix modal and component spacing

## Scope
Wide — touched 21 files across renderer, main, and build config.
