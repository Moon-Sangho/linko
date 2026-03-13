# Window Management Guide (Linko)

## File Structure

```
src/main/
├── index.ts          # App entry — window creation here
└── ipc/
    └── window.ts     # IPC handlers for window controls
```

## Window Creation

```typescript
// src/main/index.ts
import { app, BrowserWindow } from 'electron';
import path from 'path';
import { is } from '@electron-toolkit/utils';

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false, // show after ready-to-show
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  win.on('ready-to-show', () => win.show());

  if (is.dev) {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  return win;
}
```

## Window State Persistence

Use `electron-store` to persist window size and position across sessions:

```typescript
import Store from 'electron-store';

const store = new Store();

function saveWindowState(win: BrowserWindow): void {
  if (!win.isMinimized() && !win.isMaximized()) {
    const [x, y] = win.getPosition();
    const [width, height] = win.getSize();
    store.set('windowState', { x, y, width, height });
  }
}

function restoreWindowState(win: BrowserWindow): void {
  const state = store.get('windowState') as
    | { x: number; y: number; width: number; height: number }
    | undefined;
  if (state) win.setBounds(state);
}

win.on('close', () => saveWindowState(win));
restoreWindowState(win);
```

## Window Control IPC

```typescript
// src/main/ipc/window.ts
import { ipcMain, BrowserWindow } from 'electron';
import { IpcChannels } from '../../shared/ipc-channels';

export function registerWindowHandlers(): void {
  ipcMain.handle(IpcChannels.WINDOW_MINIMIZE, () => {
    BrowserWindow.getFocusedWindow()?.minimize();
    return { success: true };
  });

  ipcMain.handle(IpcChannels.WINDOW_MAXIMIZE, () => {
    const win = BrowserWindow.getFocusedWindow();
    win?.isMaximized() ? win.restore() : win?.maximize();
    return { success: true };
  });

  ipcMain.handle(IpcChannels.WINDOW_CLOSE, () => {
    BrowserWindow.getFocusedWindow()?.close();
    return { success: true };
  });
}
```

## Frameless Window (Custom Titlebar)

```typescript
const win = new BrowserWindow({
  frame: false,
  titleBarStyle: 'hidden', // macOS: keeps traffic lights
});
```

```css
.titlebar { -webkit-app-region: drag; }
.titlebar button { -webkit-app-region: no-drag; }
```

## Best Practices

1. Always use `show: false` + `ready-to-show` to avoid white flash on startup
2. Always set secure `webPreferences` (`contextIsolation: true`, `nodeIntegration: false`)
3. Handle `webContents.on('render-process-gone')` for crash recovery
4. Clean up resources on `win.on('closed')`
