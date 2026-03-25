---
name: desktop
description: Electron desktop development guide for Linko. Use when implementing IPC handlers, preload scripts, window management, menu configuration, or file system operations.
disable-model-invocation: true
---

# Desktop Development Guide (Linko)

## Architecture Overview

Linko uses Electron with strict main-renderer separation:

1. **Main Process** (`src/main/`): App lifecycle, SQLite, IPC handlers, system APIs
2. **Renderer Process** (`src/renderer/`): React app — NO direct Node.js access
3. **Preload Script** (`src/main/preload.ts`): Exposes IPC bridge to renderer via contextBridge

```
Main Process                      Renderer Process
┌─────────────────────┐          ┌─────────────────────┐
│ ipcMain.handle()    │◄──IPC───►│ window.electron      │
│ src/main/ipc/       │          │   .invoke()          │
└─────────────────────┘          └─────────────────────┘
         │                                │
         ▼                          ┌─────┴──────────────┐
┌─────────────────────┐          ┌──▼──────────────┐  ┌─▼──────────────┐
│ SQLite / fs / fetch │          │ TanStack Query  │  │ Zustand Store  │
└─────────────────────┘          │ (server state)  │  │ (UI state)     │
         ▲                       └─────────────────┘  └────────────────┘
┌─────────────────────┐
│ preload.ts          │
│ contextBridge       │
└─────────────────────┘
```

**State management split:**
- **TanStack Query** — server state: data fetched from SQLite via IPC (bookmarks, tags, etc.)
- **Zustand** — UI state only: search query, selected tag filters, modal open/close, etc.

## Adding a New Feature

### 1. Define IPC Channel

Location: `src/shared/ipc-channels.ts`

```typescript
export const IpcChannels = {
  NEW_FEATURE_ACTION: 'new-feature:action',
} as const;
```

### 2. Define Shared Types

Location: `src/shared/types.ts`

```typescript
export interface NewFeatureInput { }
export interface NewFeatureResult {
  success: boolean;
  error?: string;
}
```

### 3. Implement IPC Handler (Main Process)

Location: `src/main/ipc/new-feature.ts`

```typescript
import { ipcMain } from 'electron';
import { IpcChannels } from '../../shared/ipc-channels';
import type { NewFeatureInput, NewFeatureResult } from '../../shared/types';

export function registerNewFeatureHandlers(): void {
  ipcMain.handle(
    IpcChannels.NEW_FEATURE_ACTION,
    async (_, input: NewFeatureInput): Promise<NewFeatureResult> => {
      try {
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    },
  );
}
```

Register in `src/main/index.ts`:

```typescript
import { registerNewFeatureHandlers } from './ipc/new-feature';
registerNewFeatureHandlers();
```

### 4. Call from Renderer

**Reads** — use `useQuery` via a hook in `src/renderer/hooks/queries/`:

```typescript
// src/renderer/hooks/queries/use-new-feature-query.ts
import { useQuery } from '@tanstack/react-query'
import { IpcChannels } from '@shared/ipc-channels'
import type { NewFeatureResult } from '@shared/types'
import { queryKeys } from '@renderer/lib/query-keys'

export function useNewFeatureQuery() {
  return useQuery({
    queryKey: queryKeys.newFeature.all,
    queryFn: () =>
      window.electron.invoke(IpcChannels.NEW_FEATURE_GET) as Promise<NewFeatureResult[]>,
  })
}
```

**Mutations** — use `useMutation` via a hook in `src/renderer/hooks/mutations/`:

```typescript
// src/renderer/hooks/mutations/use-new-feature-action-mutation.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { IpcChannels } from '@shared/ipc-channels'
import type { NewFeatureInput, NewFeatureResult, IpcResult } from '@shared/types'
import { queryKeys } from '@renderer/lib/query-keys'

export function useNewFeatureActionMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: NewFeatureInput) => {
      const result = (await window.electron.invoke(
        IpcChannels.NEW_FEATURE_ACTION,
        input,
      )) as IpcResult<NewFeatureResult>
      if (!result.success || !result.data)
        throw new Error(result.error ?? 'Action failed')
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.newFeature.all })
    },
  })
}
```

Add query keys in `src/renderer/lib/query-keys.ts`:

```typescript
newFeature: {
  all: ['new-feature'] as const,
}
```

## Detailed Guides

- **Feature implementation patterns**: `references/feature-implementation.md`
- **Window management**: `references/window-management.md`
- **Menu configuration**: `references/menu-config.md`
- **File system operations**: `references/file-system.md`

## Best Practices

1. **Security**: Always `contextIsolation: true`, `nodeIntegration: false`
2. **Type safety**: Define all IPC types in `src/shared/types.ts`
3. **Error handling**: Always return structured `{ success: boolean; error?: string }` results
4. **Channel naming**: Use `domain:action` format (e.g. `bookmarks:create`)
5. **No Node in renderer**: All Node/fs/db calls go through IPC only
