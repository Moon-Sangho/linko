# Feature Implementation Guide (Linko)

## Architecture

```
Main Process                    Renderer Process
┌──────────────────┐           ┌──────────────────┐
│ ipcMain.handle() │◄──IPC───►│ window.electron  │
│ src/main/ipc/    │           │   .invoke()      │
└──────────────────┘           └──────────────────┘
        │                              │
        ▼                              ▼
┌──────────────────┐           ┌──────────────────┐
│ SQLite / fs /    │           │ Zustand Store    │
│ network          │           │ (UI State)       │
└──────────────────┘           └──────────────────┘
```

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

### 4. Call from Renderer (Zustand Store)

```typescript
// src/renderer/store/useAppStore.ts
showNotification: async (title: string, body: string) => {
  const result = await window.electron.invoke(
    IpcChannels.NOTIFICATION_SHOW,
    { title, body },
  );
  if (!result.success) {
    console.error('Notification failed:', result.error);
  }
},
```

## Best Practices

1. **Security**: Validate inputs in main process, never trust renderer data blindly
2. **Performance**: Use async handlers for all heavy operations (DB, fs, network)
3. **Error handling**: Always return `{ success, error }` — never throw across IPC
4. **UX**: Update Zustand state to reflect loading/error states in UI
