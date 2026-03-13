# Menu Configuration Guide (Linko)

## Menu Types

1. **App Menu**: Native menu bar (macOS top bar / Windows title bar)
2. **Context Menu**: Right-click menus
3. **Tray Menu**: System tray icon menu

## File Structure

```
src/main/
├── menus/
│   ├── app-menu.ts      # App menu template
│   └── tray-menu.ts     # Tray menu setup
└── ipc/
    └── menu.ts          # IPC handlers for menu-triggered actions
```

## App Menu

```typescript
// src/main/menus/app-menu.ts
import { app, BrowserWindow, Menu, MenuItemConstructorOptions } from 'electron';

export function createAppMenu(win: BrowserWindow): void {
  const template: MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Add Bookmark',
          accelerator: 'CmdOrCtrl+N',
          click: () => win.webContents.send('menu:add-bookmark'),
        },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
  ];

  if (process.platform === 'darwin') {
    template.unshift({ role: 'appMenu' });
  }

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}
```

## Context Menu (Bookmark)

```typescript
import { Menu, BrowserWindow } from 'electron';

export function showBookmarkContextMenu(win: BrowserWindow, bookmarkId: string): void {
  const menu = Menu.buildFromTemplate([
    {
      label: 'Open in Browser',
      click: () => win.webContents.send('context-menu:open', bookmarkId),
    },
    {
      label: 'Edit',
      click: () => win.webContents.send('context-menu:edit', bookmarkId),
    },
    { type: 'separator' },
    {
      label: 'Delete',
      click: () => win.webContents.send('context-menu:delete', bookmarkId),
    },
  ]);
  menu.popup({ window: win });
}
```

## Tray Menu

```typescript
// src/main/menus/tray-menu.ts
import { app, Menu, Tray, BrowserWindow } from 'electron';
import path from 'path';

export function createTray(win: BrowserWindow): Tray {
  const tray = new Tray(path.join(__dirname, '../../resources/tray-icon.png'));

  tray.setToolTip('Linko');
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Show Linko', click: () => { win.show(); win.focus(); } },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() },
  ]));
  tray.on('double-click', () => { win.show(); win.focus(); });

  return tray;
}
```

## Best Practices

1. Use `role` values (`copy`, `paste`, `quit`) for native OS behavior
2. Use `CmdOrCtrl` for cross-platform keyboard shortcuts
3. Use `{ type: 'separator' }` to group related items
4. Send menu actions to renderer via `webContents.send()`, not IPC invoke
5. Handle `process.platform === 'darwin'` for macOS-specific items
