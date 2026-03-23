# Renderer Conventions

Rules for all code in `src/renderer/`.

---

## No Direct Node.js Access

The renderer process must NEVER use Node.js APIs directly.
All system calls go through IPC via the contextBridge.

```typescript
// ❌ Bad — direct Node access in renderer
import fs from 'fs'
import path from 'path'
const db = require('better-sqlite3')

// ✅ Good — IPC only
const result = await window.electron.invoke(IpcChannels.BOOKMARKS_GET_ALL)
```

---

## IPC Call Pattern

All main process communication goes through `window.electron.invoke()`.

```typescript
// ✅ Correct IPC call pattern
import { IpcChannels } from '@shared/ipc-channels'

const bookmarks = await window.electron.invoke(IpcChannels.BOOKMARKS_GET_ALL)
const result = await window.electron.invoke(IpcChannels.BOOKMARK_CREATE, input)
```

Never call `ipcRenderer` directly — it is not exposed in the renderer.

---

## Zustand Store Pattern

```typescript
import { create } from 'zustand'
import { IpcChannels } from '@shared/ipc-channels'
import type { Bookmark } from '@shared/types'

interface BookmarkStore {
  bookmarks: Bookmark[]
  fetchAll: () => Promise<void>
}

export const useBookmarkStore = create<BookmarkStore>((set) => ({
  bookmarks: [],
  fetchAll: async () => {
    const data = await window.electron.invoke(IpcChannels.BOOKMARKS_GET_ALL)
    set({ bookmarks: data })
  },
}))
```

Rules:
- One store file per domain (`bookmark-store.ts`, `tag-store.ts`)
- Store files live in `src/renderer/store/`
- Store shape must match `contracts.md` during parallel implementation

---

## Component Rules

- One component per file
- Keep components small and focused — if it needs more than ~150 lines, split it
- Props interface defined in the same file as the component (not in `types.ts`)
- Use `@radix-ui/react-*` for accessible primitives (dialog, dropdown, etc.)
- Use `cmdk` for command palette / search UI

```typescript
// ✅ Props defined co-located with component
interface BookmarkCardProps {
  bookmark: Bookmark
  onDelete: (id: string) => void
}

export function BookmarkCard({ bookmark, onDelete }: BookmarkCardProps) {
  // ...
}
```

---

## Packages

| Package | Purpose |
|---------|---------|
| `react` + `react-dom` | UI framework |
| `zustand` | State management |
| `tailwindcss` | Styling |
| `@radix-ui/react-*` | Accessible UI primitives |
| `cmdk` | Command palette / search |
