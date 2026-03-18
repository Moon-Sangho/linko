# QA Fix Contracts

This document defines the exact changes required for each file in the QA fix sprint.
No new types or IPC channels are introduced. `src/shared/types.ts` and
`src/shared/ipc-channels.ts` are FROZEN — do not modify them.

---

## Import Alias Rules (applies to all files)

| Pattern | Rule |
|---------|------|
| Cross-directory `../../../shared/...` | Replace with `@shared/...` |
| Cross-directory `../../shared/...` | Replace with `@shared/...` |
| Cross-directory `../../store/...` | Replace with `@renderer/store/...` |
| Cross-directory `../../hooks/...` | Replace with `@renderer/hooks/...` |
| Same-directory `./Foo` | Keep as-is |

---

## Agent A — Renderer Component Fixes

### src/renderer/components/bookmark/index.ts
**Action**: DELETE this file entirely.
No consumer imports from this barrel; deletion is safe.

### src/renderer/components/ui/index.ts
**Action**: DELETE this file entirely.
No consumer imports from this barrel; deletion is safe.

### src/renderer/components/bookmark/BookmarkItem.tsx
Fix these import lines:
```typescript
// BEFORE
import { Bookmark } from '../../../shared/types';
import { useBookmarkStore } from '../../store/useBookmarkStore';

// AFTER
import type { Bookmark } from '@shared/types';
import { useBookmarkStore } from '@renderer/store/useBookmarkStore';
```
All same-directory imports (`./EditBookmarkModal`, `../ui/Favicon`, `../ui/Badge`) stay as-is.

### src/renderer/components/bookmark/BookmarkList.tsx
Fix these import lines:
```typescript
// BEFORE
import { useBookmarkStore } from '../../store/useBookmarkStore';
import { useUIStore } from '../../store/useUIStore';
import { useSearch } from '../../hooks/useSearch';

// AFTER
import { useBookmarkStore } from '@renderer/store/useBookmarkStore';
import { useUIStore } from '@renderer/store/useUIStore';
import { useSearch } from '@renderer/hooks/useSearch';
```
Same-directory imports (`./AddBookmarkModal`, `./BookmarkItem`, `../ui/Spinner`, `../ui/EmptyState`) stay as-is.

### src/renderer/components/ui/TagCheckboxList.tsx
Fix this import line:
```typescript
// BEFORE
import { Tag } from '../../../shared/types';

// AFTER
import type { Tag } from '@shared/types';
```

---

## Agent B — Main Process Fixes

### src/main/ipc/bookmarks.ts
**Fix 1 — Import aliases:**
```typescript
// BEFORE
import { IpcChannels } from '../../shared/ipc-channels';
import type { ... } from '../../shared/types';

// AFTER
import { IpcChannels } from '@shared/ipc-channels';
import type { ... } from '@shared/types';
```

**Fix 2 — Security: add `isValidUrl()` to BOOKMARK_FETCH_METADATA:**
```typescript
// BEFORE
ipcMain.handle(
  IpcChannels.BOOKMARK_FETCH_METADATA,
  async (_, url: string): Promise<IpcResult<UrlMetadata>> => {
    try {
      const metadata = await fetchUrlMetadata(url);
      return { success: true, data: metadata };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },
);

// AFTER
ipcMain.handle(
  IpcChannels.BOOKMARK_FETCH_METADATA,
  async (_, url: string): Promise<IpcResult<UrlMetadata>> => {
    try {
      if (!isValidUrl(url)) return { success: false, error: 'Invalid URL' };
      const metadata = await fetchUrlMetadata(url);
      return { success: true, data: metadata };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },
);
```

### src/main/ipc/tags.ts
**Fix 1 — Import aliases:**
```typescript
// BEFORE
import { IpcChannels } from '../../shared/ipc-channels';
import type { Tag, CreateTagInput, IpcResult } from '../../shared/types';

// AFTER
import { IpcChannels } from '@shared/ipc-channels';
import type { Tag, CreateTagInput, IpcResult } from '@shared/types';
```

**Fix 2 — Security: add `isValidId()` to TAG_DELETE:**
```typescript
// BEFORE
ipcMain.handle(
  IpcChannels.TAG_DELETE,
  (_, id: number): IpcResult => {
    try {
      repo.delete(id);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },
);

// AFTER
ipcMain.handle(
  IpcChannels.TAG_DELETE,
  (_, id: number): IpcResult => {
    try {
      if (!isValidId(id)) return { success: false, error: 'Invalid id' };
      repo.delete(id);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },
);

// Add this helper at the bottom of the file (after registerTagHandlers):
function isValidId(id: unknown): id is number {
  return typeof id === 'number' && Number.isInteger(id) && id > 0;
}
```

### src/main/ipc/file-system.ts
**Fix 1 — Import aliases:**
```typescript
// BEFORE
import { IpcChannels } from '../../shared/ipc-channels';
import type { Bookmark, ImportSummary, IpcResult } from '../../shared/types';

// AFTER
import { IpcChannels } from '@shared/ipc-channels';
import type { Bookmark, ImportSummary, IpcResult } from '@shared/types';
```

**Fix 2 — Security: validate bookmarks array shape in FS_EXPORT_BOOKMARKS:**
```typescript
// BEFORE
ipcMain.handle(
  IpcChannels.FS_EXPORT_BOOKMARKS,
  async (_, bookmarks: Bookmark[]): Promise<IpcResult> => {
    ...
    try {
      await fs.writeFile(filePath, JSON.stringify(bookmarks, null, 2), 'utf-8');
      return { success: true };
    } ...
  },
);

// AFTER
ipcMain.handle(
  IpcChannels.FS_EXPORT_BOOKMARKS,
  async (_, bookmarks: unknown): Promise<IpcResult> => {
    if (!Array.isArray(bookmarks)) {
      return { success: false, error: 'Invalid bookmarks payload' };
    }
    ...
    try {
      await fs.writeFile(filePath, JSON.stringify(bookmarks, null, 2), 'utf-8');
      return { success: true };
    } ...
  },
);
```

### src/main/ipc/app.ts
**Fix — Import aliases:**
```typescript
// BEFORE
import { IpcChannels } from '../../shared/ipc-channels';
import type { IpcResult } from '../../shared/types';

// AFTER
import { IpcChannels } from '@shared/ipc-channels';
import type { IpcResult } from '@shared/types';
```

### src/main/ipc/window.ts
**Fix — Import aliases:**
```typescript
// BEFORE
import { IpcChannels } from '../../shared/ipc-channels';
import type { IpcResult } from '../../shared/types';

// AFTER
import { IpcChannels } from '@shared/ipc-channels';
import type { IpcResult } from '@shared/types';
```

### src/main/index.ts
**Fix — Import alias:**
```typescript
// BEFORE
import type { WindowState } from '../shared/types';

// AFTER
import type { WindowState } from '@shared/types';
```

### src/main/db/repositories/bookmark-repository.ts
**Fix — Import aliases:**
```typescript
// BEFORE
import type { Bookmark, Tag, CreateBookmarkInput, UpdateBookmarkInput, SearchBookmarksInput } from '../../../shared/types';

// AFTER
import type { Bookmark, Tag, CreateBookmarkInput, UpdateBookmarkInput, SearchBookmarksInput } from '@shared/types';
```

### src/main/db/repositories/tag-repository.ts
**Fix — Import aliases:**
```typescript
// BEFORE
import type { Tag, CreateTagInput } from '../../../shared/types';

// AFTER
import type { Tag, CreateTagInput } from '@shared/types';
```

---

## Agent C — Config Fixes

### electron.vite.config.ts
**Fix — Add `@main` alias to main and preload sections:**
```typescript
// BEFORE
const sharedAlias = {
  '@shared': resolve(__dirname, 'src/shared'),
};

// AFTER
const sharedAlias = {
  '@shared': resolve(__dirname, 'src/shared'),
};
const mainAlias = {
  ...sharedAlias,
  '@main': resolve(__dirname, 'src/main'),
};
```
And update the `main` and `preload` sections to use `mainAlias` instead of `sharedAlias`:
```typescript
main: {
  plugins: [externalizeDepsPlugin()],
  resolve: { alias: mainAlias },
  ...
},
preload: {
  plugins: [externalizeDepsPlugin()],
  resolve: { alias: mainAlias },
  ...
},
```

### package.json
**Fix — Add Windows build target:**
```json
"build": {
  "appId": "com.linko.app",
  "productName": "Linko",
  "mac": {
    "target": ["dmg"],
    "category": "public.app-category.productivity"
  },
  "win": {
    "target": ["nsis"]
  },
  "files": ["out/**/*"],
  "extraResources": [],
  "asar": true
}
```
