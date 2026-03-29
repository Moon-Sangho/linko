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

## Keyboard Event Containment

When a component owns a focused input (e.g. an inline rename field), it must call `e.stopPropagation()` in its `onKeyDown` handler to prevent keydown events from leaking to global `window` listeners.

```typescript
// ✅ Correct — stop at the boundary
function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
  e.stopPropagation();
  if (e.key === 'Enter') { ... }
  if (e.key === 'Escape') { ... }
}

// ❌ Wrong — guard in the global listener
window.addEventListener('keydown', (e) => {
  if (e.target instanceof HTMLInputElement) return; // symptomatic workaround
  ...
});
```

**Why**: The leak is the problem, not the listener. Fix at the source (the input boundary) so global shortcuts remain simple and components are self-contained.

---

## Modal / Overlay Pattern

All modals must be opened via the imperative `overlay.open()` API — never by managing a local `isOpen` state in the parent component.

```typescript
// ✅ Correct — imperative overlay
import { overlay } from '@renderer/overlay/control'

overlay.open(({ isOpen, close }) => (
  <MyModal isOpen={isOpen} onClose={close} />
))

// ❌ Wrong — local isOpen state
const [isOpen, setIsOpen] = useState(false)
<MyModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
```

Rules:
- `overlay.open()` returns an `id` — use `overlay.close(id)` if you need to close it programmatically from outside
- Modal components must accept `isOpen: boolean` and `onClose: () => void` props (consumed by `OverlayProvider`)
- `OverlayProvider` is mounted once in `App.tsx` — do not mount it elsewhere
- Modal component files live in the same domain folder as their trigger (e.g. `src/renderer/components/tag/tag-delete-modal.tsx`)

---

## Tailwind Class Merging

Use `cn` from `@renderer/lib/cn` when a className has conditional logic or needs merge conflict resolution.
For static classNames with no branching, a plain string is preferred.

```typescript
import { cn } from '@renderer/lib/cn'

// ✅ Use cn — conditional logic
<div className={cn('base-class', isActive && 'bg-blue-500', variant === 'ghost' && 'bg-transparent')} />

// ✅ Use cn — merging classes that may conflict
<div className={cn('bg-gray-800', className)} />

// ✅ Plain string — no conditionals, no merging needed
<div className="flex items-center gap-2 text-sm" />

// ❌ Wrong — array join instead of cn
<div className={['base-class', isActive ? 'bg-blue-500' : ''].join(' ')} />

// ❌ Wrong — template literal instead of cn
<div className={`base-class ${isActive ? 'bg-blue-500' : ''}`} />

// ❌ Wrong — cn wrapping a static string (unnecessary)
<div className={cn('flex items-center gap-2')} />
```

**Why**: `cn` uses `clsx` for conditional logic and `tailwind-merge` to resolve conflicting
Tailwind classes (e.g. `bg-gray-800 bg-blue-500` → last one wins correctly).
Don't wrap static strings in `cn` — it adds noise with no benefit.

---

## Packages

| Package | Purpose |
|---------|---------|
| `react` + `react-dom` | UI framework |
| `zustand` | State management |
| `tailwindcss` | Styling |
| `@radix-ui/react-*` | Accessible UI primitives |
| `cmdk` | Command palette / search |
