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
         ▼                                ▼
┌─────────────────────┐          ┌─────────────────────┐
│ SQLite / fs / fetch │          │ Zustand Store        │
└─────────────────────┘          └─────────────────────┘
         ▲
┌─────────────────────┐
│ preload.ts          │
│ contextBridge       │
└─────────────────────┘
```

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

```typescript
const result = await window.electron.invoke(IpcChannels.NEW_FEATURE_ACTION, input);
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
