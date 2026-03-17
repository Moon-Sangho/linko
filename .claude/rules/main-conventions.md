# Main Process Conventions

Rules for all code in `src/main/`.

---

## Repository Pattern

All data access must go through a repository interface.
This enables future LocalRepository → RemoteRepository migration.

```typescript
// ✅ Define interface first in src/main/db/
interface BookmarkRepository {
  getAll(): Bookmark[]
  getById(id: string): Bookmark | null
  create(data: CreateBookmarkInput): Bookmark
  update(id: string, data: UpdateBookmarkInput): Bookmark
  delete(id: string): void
  search(query: string): Bookmark[]
}

// ✅ Implement as LocalRepository
class LocalBookmarkRepository implements BookmarkRepository {
  // better-sqlite3 implementation
}
```

Never call SQLite directly from IPC handlers — always go through a repository.

---

## IPC Handler Pattern

```typescript
// ✅ Correct IPC handler structure
import { ipcMain } from 'electron'
import { IpcChannels } from '@shared/ipc-channels'
import type { CreateBookmarkInput } from '@shared/types'

export function registerBookmarkHandlers(repo: BookmarkRepository): void {
  ipcMain.handle(IpcChannels.BOOKMARKS_GET_ALL, async () => {
    return repo.getAll()
  })

  ipcMain.handle(
    IpcChannels.BOOKMARK_CREATE,
    async (_, input: CreateBookmarkInput) => {
      try {
        return { success: true, data: repo.create(input) }
      } catch (error) {
        return { success: false, error: (error as Error).message }
      }
    },
  )
}
```

Rules:
- One handler file per domain: `src/main/ipc/bookmarks.ts`, `src/main/ipc/tags.ts`
- Register all handlers in `src/main/index.ts`
- Inject repository as a parameter (not imported directly) for testability

---

## IPC Response Shape

All handlers that mutate data must return a structured result:

```typescript
// ✅ Mutation response
{ success: true, data: T }
{ success: false, error: string }

// ✅ Read response — return data directly (no wrapper needed)
return repo.getAll()  // Bookmark[]
```

---

## IPC Channel Naming

Channel names follow `domain:action` format, defined in `src/shared/ipc-channels.ts`.

```typescript
// ✅ Good
'bookmark:get-all'
'bookmark:create'
'bookmark:delete'
'tag:get-all'

// ❌ Bad
'GET_BOOKMARKS'
'bookmarkCreate'
'getAll'
```

---

## preload.ts — contextBridge

The preload script exposes only `invoke` — nothing else.

```typescript
// ✅ src/main/preload.ts
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electron', {
  invoke: (channel: string, ...args: unknown[]) =>
    ipcRenderer.invoke(channel, ...args),
})
```

Do NOT expose `ipcRenderer` directly or add extra methods without explicit reason.

---

## File Structure

```
src/main/
├── index.ts          ← app entry, registers all handlers
├── preload.ts        ← contextBridge only
├── ipc/              ← one file per domain
│   ├── bookmarks.ts
│   └── tags.ts
├── db/               ← schema, migrations, repositories
│   ├── schema.ts
│   └── repositories/
└── services/         ← url-fetcher, importer
```
