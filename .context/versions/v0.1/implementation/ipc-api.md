# Linko IPC API Reference

_Written by: /agent-dev-core | Last updated: 2026-03-15_

All renderer ↔ main communication goes through `window.electron.invoke(channel, ...args)`.
Channel names are constants from `src/shared/ipc-channels.ts`.
All handlers return `IpcResult<T>` — always check `result.success` before using `result.data`.

---

## Types (src/shared/types.ts)

```typescript
interface Bookmark {
  id: number;
  url: string;
  title: string | null;
  notes: string | null;
  favicon_url: string | null;
  created_at: string;    // ISO 8601
  updated_at: string;    // ISO 8601
  tags: Tag[];
}

interface Tag {
  id: number;
  name: string;
}

interface IpcResult<T = undefined> {
  success: boolean;
  data?: T;
  error?: string;
}

interface CreateBookmarkInput {
  url: string;
  title?: string | null;
  notes?: string | null;
  favicon_url?: string | null;
  tagIds?: number[];
}

interface UpdateBookmarkInput {
  url?: string;
  title?: string | null;
  notes?: string | null;
  favicon_url?: string | null;
  tagIds?: number[];        // replaces all current tags when present
}

interface SearchBookmarksInput {
  query?: string;           // full-text search (url + title + notes)
  tagIds?: number[];        // OR filter — bookmark must have at least one
}

interface CreateTagInput {
  name: string;
}

interface ImportSummary {
  added: number;
  skipped: number;          // duplicate URLs
  errors: number;           // invalid URLs / parse failures
}

interface UrlMetadata {
  title: string | null;
  favicon_url: string | null;
}
```

---

## Bookmarks

### `bookmarks:get-all`
Returns all bookmarks, ordered newest first (no search/filter).

```typescript
const result = await window.electron.invoke('bookmarks:get-all');
// result: IpcResult<Bookmark[]>
```

---

### `bookmarks:search`
Full-text search + optional tag filter. Results are FTS5-ranked when query is present.

```typescript
const result = await window.electron.invoke('bookmarks:search', {
  query: 'react hooks',     // optional — searches url, title, notes
  tagIds: [1, 3],           // optional — OR filter
} satisfies SearchBookmarksInput);
// result: IpcResult<Bookmark[]>
```

---

### `bookmark:get-by-id`
Fetch a single bookmark by ID (includes tags).

```typescript
const result = await window.electron.invoke('bookmark:get-by-id', id);
// result: IpcResult<Bookmark | null>
```

---

### `bookmark:create`
Create a new bookmark. Validates URL scheme (http/https only).

```typescript
const result = await window.electron.invoke('bookmark:create', {
  url: 'https://example.com',
  title: 'Example',          // optional — auto-fetched if omitted
  notes: null,               // optional
  favicon_url: null,         // optional
  tagIds: [1, 2],            // optional
} satisfies CreateBookmarkInput);
// result: IpcResult<Bookmark>
```

**Tip**: call `bookmark:fetch-metadata` first to pre-populate title + favicon.

---

### `bookmark:update`
Update an existing bookmark. Only provided fields are changed.
Providing `tagIds` replaces the bookmark's entire tag set.

```typescript
const result = await window.electron.invoke('bookmark:update', id, {
  title: 'New title',
  tagIds: [3],
} satisfies UpdateBookmarkInput);
// result: IpcResult<Bookmark>
```

---

### `bookmark:delete`
Delete a bookmark by ID.

```typescript
const result = await window.electron.invoke('bookmark:delete', id);
// result: IpcResult
```

---

### `bookmark:open`
Open a URL in the user's default browser (via shell.openExternal).

```typescript
const result = await window.electron.invoke('bookmark:open', bookmark.url);
// result: IpcResult
```

---

### `bookmark:fetch-metadata`
Fetch page title and favicon from a URL. Call before creating a bookmark to auto-populate fields.
Times out after 5 seconds; always returns a result (never throws).

```typescript
const result = await window.electron.invoke('bookmark:fetch-metadata', url);
// result: IpcResult<UrlMetadata>
// result.data = { title: 'Page Title', favicon_url: 'https://example.com/favicon.ico' }
```

---

### `bookmark:check-duplicate`
Check if a URL already exists in the database. Use for duplicate warnings on the add form.

```typescript
const result = await window.electron.invoke('bookmark:check-duplicate', url, excludeId?);
// result: IpcResult<boolean>   true = duplicate found
```

---

## Tags

### `tags:get-all`
Returns all tags, sorted alphabetically (case-insensitive).

```typescript
const result = await window.electron.invoke('tags:get-all');
// result: IpcResult<Tag[]>
```

---

### `tag:create`
Create a new tag. Names are unique (case-insensitive).

```typescript
const result = await window.electron.invoke('tag:create', { name: 'design' } satisfies CreateTagInput);
// result: IpcResult<Tag>
```

---

### `tag:delete`
Delete a tag. All bookmark associations are removed automatically (CASCADE).

```typescript
const result = await window.electron.invoke('tag:delete', id);
// result: IpcResult
```

---

## File System

### `fs:import-bookmarks`
Opens a native file picker, imports a browser-exported HTML bookmark file.
Shows import summary in the result.

```typescript
const result = await window.electron.invoke('fs:import-bookmarks');
// result: IpcResult<ImportSummary>
// result.data = { added: 42, skipped: 3, errors: 0 }
```

---

### `fs:export-bookmarks`
Opens a native save dialog, writes all bookmarks as JSON.

```typescript
const result = await window.electron.invoke('fs:export-bookmarks', bookmarks);
// result: IpcResult
```

---

## Window Controls

### `window:minimize` / `window:maximize` / `window:close`

Use for a custom frameless titlebar (macOS: titleBarStyle = 'hiddenInset').

```typescript
await window.electron.invoke('window:minimize');
await window.electron.invoke('window:maximize');  // toggles restore/maximize
await window.electron.invoke('window:close');
```

---

## App

### `app:get-version`
Returns the app version string from package.json.

```typescript
const result = await window.electron.invoke('app:get-version');
// result: IpcResult<string>   e.g. "0.1.0"
```

---

## Usage Pattern in Zustand Store

```typescript
// src/renderer/store/useBookmarkStore.ts
import { IpcChannels } from '../../../shared/ipc-channels';
import type { Bookmark, CreateBookmarkInput, IpcResult } from '../../../shared/types';

interface BookmarkStore {
  bookmarks: Bookmark[];
  isLoading: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
  create: (input: CreateBookmarkInput) => Promise<Bookmark | null>;
}

// In action:
const result = await window.electron.invoke(
  IpcChannels.BOOKMARK_CREATE,
  input,
) as IpcResult<Bookmark>;

if (!result.success) {
  set({ error: result.error ?? 'Unknown error' });
  return null;
}
return result.data!;
```
