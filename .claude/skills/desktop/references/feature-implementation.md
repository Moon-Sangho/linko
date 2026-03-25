# Feature Implementation Guide (Linko)

## Architecture

```
Main Process                    Renderer Process
┌──────────────────┐           ┌──────────────────┐
│ ipcMain.handle() │◄──IPC───►│ window.electron  │
│ src/main/ipc/    │           │   .invoke()      │
└──────────────────┘           └──────────────────┘
        │                        ┌───────┴──────────────┐
        ▼                   ┌────▼────────────┐  ┌──────▼──────────┐
┌──────────────────┐        │ TanStack Query  │  │ Zustand Store   │
│ SQLite / fs /    │        │ (server state)  │  │ (UI state only) │
│ network          │        └─────────────────┘  └─────────────────┘
└──────────────────┘
```

**State split:**
- **TanStack Query** — server state fetched from SQLite via IPC (hooks in `src/renderer/hooks/queries/` and `src/renderer/hooks/mutations/`)
- **Zustand** — UI-only state: filters, search input, modal visibility, etc.

## Step-by-Step: Example (System Notification)

### 1. Define IPC Channel

```typescript
// src/shared/ipc-channels.ts
export const IpcChannels = {
  NOTIFICATION_SHOW: 'notification:show',
} as const;
```

### 2. Define Types

```typescript
// src/shared/types.ts
export interface ShowNotificationInput {
  title: string;
  body: string;
}
export interface NotificationResult {
  success: boolean;
  error?: string;
}
```

### 3. IPC Handler (Main Process)

```typescript
// src/main/ipc/notification.ts
import { ipcMain, Notification } from 'electron';
import { IpcChannels } from '../../shared/ipc-channels';
import type { ShowNotificationInput, NotificationResult } from '../../shared/types';

export function registerNotificationHandlers(): void {
  ipcMain.handle(
    IpcChannels.NOTIFICATION_SHOW,
    async (_, input: ShowNotificationInput): Promise<NotificationResult> => {
      if (!Notification.isSupported()) {
        return { success: false, error: 'Notifications not supported' };
      }
      try {
        new Notification({ title: input.title, body: input.body }).show();
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    },
  );
}
```

### 4. Call from Renderer

**Mutations** (actions that change data) — use `useMutation` in `src/renderer/hooks/mutations/`:

```typescript
// src/renderer/hooks/mutations/use-show-notification-mutation.ts
import { useMutation } from '@tanstack/react-query'
import { IpcChannels } from '@shared/ipc-channels'
import type { ShowNotificationInput, NotificationResult, IpcResult } from '@shared/types'

export function useShowNotificationMutation() {
  return useMutation({
    mutationFn: async (input: ShowNotificationInput) => {
      const result = (await window.electron.invoke(
        IpcChannels.NOTIFICATION_SHOW,
        input,
      )) as IpcResult<NotificationResult>
      if (!result.success) throw new Error(result.error ?? 'Notification failed')
      return result.data
    },
  })
}
```

Use in a component:

```typescript
const { mutate: showNotification, isPending } = useShowNotificationMutation()
showNotification({ title: 'Hello', body: 'World' })
```

**Reads** (queries that fetch data) — use `useQuery` in `src/renderer/hooks/queries/`.
See `SKILL.md` for the query hook pattern.

## Best Practices

1. **Security**: Validate inputs in main process, never trust renderer data blindly
2. **Performance**: Use async handlers for all heavy operations (DB, fs, network)
3. **Error handling**: Throw in `mutationFn` on failure — TanStack Query surfaces it via `error` and `isError`
4. **Cache invalidation**: Call `queryClient.invalidateQueries` in `onSuccess` when a mutation affects cached query data
5. **UI state**: Loading/error states come from TanStack Query (`isPending`, `isError`) — no need to mirror them in Zustand
