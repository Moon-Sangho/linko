# File System Operations Guide (Linko)

## Overview

File system access runs in the main process only.
Renderer triggers import/export operations via IPC.

## IPC Channels

```typescript
// src/shared/ipc-channels.ts
export const IpcChannels = {
  FS_IMPORT_BOOKMARKS: 'fs:import-bookmarks',
  FS_EXPORT_BOOKMARKS: 'fs:export-bookmarks',
} as const;
```

## Import Bookmarks (Browser HTML Format)

```typescript
// src/main/ipc/file-system.ts
import { ipcMain, dialog } from 'electron';
import fs from 'fs/promises';
import { IpcChannels } from '../../shared/ipc-channels';
import type { Bookmark } from '../../shared/types';

export function registerFileSystemHandlers(): void {
  ipcMain.handle(IpcChannels.FS_IMPORT_BOOKMARKS, async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: 'Import Bookmarks',
      filters: [{ name: 'HTML Bookmark File', extensions: ['html', 'htm'] }],
      properties: ['openFile'],
    });

    if (canceled || filePaths.length === 0) return { success: false };

    try {
      const html = await fs.readFile(filePaths[0], 'utf-8');
      const bookmarks = parseBrowserBookmarks(html);
      return { success: true, bookmarks };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle(IpcChannels.FS_EXPORT_BOOKMARKS, async (_, bookmarks: Bookmark[]) => {
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: 'Export Bookmarks',
      defaultPath: 'linko-bookmarks.json',
      filters: [{ name: 'JSON', extensions: ['json'] }],
    });

    if (canceled || !filePath) return { success: false };

    try {
      await fs.writeFile(filePath, JSON.stringify(bookmarks, null, 2), 'utf-8');
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });
}

// Parse Netscape Bookmark Format (exported by all major browsers)
function parseBrowserBookmarks(html: string): Partial<Bookmark>[] {
  const urlRegex = /<a href="([^"]+)"[^>]*>([^<]+)<\/a>/gi;
  const bookmarks: Partial<Bookmark>[] = [];
  let match: RegExpExecArray | null;

  while ((match = urlRegex.exec(html)) !== null) {
    bookmarks.push({ url: match[1], title: match[2] });
  }
  return bookmarks;
}
```

## Call from Renderer

```typescript
// src/renderer/hooks/use-file-system.ts
import { IpcChannels } from '../../../shared/ipc-channels';

export function useFileSystem() {
  const importBookmarks = async () => {
    const result = await window.electron.invoke(IpcChannels.FS_IMPORT_BOOKMARKS);
    if (result.success) return result.bookmarks;
    return [];
  };

  const exportBookmarks = async (bookmarks: Bookmark[]) => {
    return window.electron.invoke(IpcChannels.FS_EXPORT_BOOKMARKS, bookmarks);
  };

  return { importBookmarks, exportBookmarks };
}
```

## Best Practices

1. Always use `dialog.showOpenDialog` / `dialog.showSaveDialog` — never hardcode paths
2. Validate file content before processing (size limits, format checks)
3. Return structured `{ success, error }` — never throw across IPC boundary
