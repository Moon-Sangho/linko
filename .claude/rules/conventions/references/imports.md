# Import Conventions

## No Barrel Exports

Do **not** create `index.ts` barrel files (re-export aggregators).

```typescript
// ❌ Bad — barrel export (blocks tree-shaking)
// src/renderer/components/index.ts
export { BookmarkCard } from './bookmark-card'
export { TagBadge } from './tag-badge'
export { SearchBar } from './search-bar'

// ✅ Good — direct import with absolute alias
import { BookmarkCard } from '@renderer/components/bookmark/bookmark-card'
import { TagBadge } from '@renderer/components/tag/tag-badge'
```

**Why**: Bundlers cannot tree-shake through barrel re-exports reliably.
Every import from a barrel pulls in the entire module graph of that barrel,
increasing bundle size and slowing cold start.

---

## Absolute Imports (Path Aliases)

**Prefer absolute path aliases over relative paths.**
Use relative paths only for files in the same directory.

Path aliases are configured in `tsconfig.json`:

```json
"paths": {
  "@shared/*": ["src/shared/*"],
  "@main/*":   ["src/main/*"],
  "@renderer/*": ["src/renderer/*"]
}
```

```typescript
// ❌ Bad — relative path crossing directory boundaries
import { useUIStore } from '../../store/use-ui-store'
import type { Bookmark } from '../../../shared/types'

// ✅ Good — absolute alias
import { useUIStore } from '@renderer/store/use-ui-store'
import type { Bookmark } from '@shared/types'
import { IpcChannels } from '@shared/ipc-channels'
```

**Rule of thumb**:
- Same directory → relative (`./bookmark-card`)
- Different directory → absolute alias (`@renderer/...`, `@shared/...`)

---

## Import Path Rules

Always import from the exact file that owns the export.

```typescript
// ❌ Bad — barrel or ambiguous path
import { useUIStore } from '@renderer/store'
import { Bookmark } from '@shared'

// ✅ Good — exact file
import { useUIStore } from '@renderer/store/use-ui-store'
import type { Bookmark } from '@shared/types'
```

---

## Shared Types

`src/shared/types.ts` and `src/shared/ipc-channels.ts` own their exports
directly (not re-exporting from elsewhere), so they are not barrels.

```typescript
// ✅ Correct
import type { Bookmark, Tag } from '@shared/types'
import { IpcChannels } from '@shared/ipc-channels'
```

---

## Summary

| Pattern | Allowed |
|---------|---------|
| `import X from './sibling-file'` | ✅ same-dir relative |
| `import X from '@renderer/components/bookmark/bookmark-card'` | ✅ absolute alias |
| `import X from '@shared/types'` | ✅ absolute alias |
| `import X from '../../shared/types'` | ❌ cross-dir relative |
| `import X from '@renderer/components/index'` | ❌ barrel |
| `export { X } from './X'` in index.ts | ❌ barrel |
