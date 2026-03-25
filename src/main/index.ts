import { app, BrowserWindow, dialog } from 'electron';
import path from 'path';
import { is } from '@electron-toolkit/utils';
import type ElectronStore from 'electron-store';
import { getDatabase, closeDatabase } from './db/database';
import { LocalBookmarkRepository } from './db/repositories/bookmark-repository';
import { LocalTagRepository } from './db/repositories/tag-repository';
import { registerBookmarkHandlers } from './ipc/bookmarks';
import { registerTagHandlers } from './ipc/tags';
import { registerWindowHandlers } from './ipc/window';
import { registerFileSystemHandlers } from './ipc/file-system';
import { registerAppHandlers } from './ipc/app';
import type { WindowState } from '@shared/types/domains';

const isDev = is.dev;

// Keep dev data isolated from packaged app data.
if (isDev) {
  const devUserData = path.join(app.getPath('appData'), 'Linko-Dev');
  app.setPath('userData', devUserData);
}

// ─── App Store (settings / window state) ─────────────────────────────────────
// electron-store v11+ is ESM-only; use dynamic import to avoid CJS require() failure.

let store!: InstanceType<typeof ElectronStore<{ windowState: WindowState }>>;

// ─── IPC Handler Registration ─────────────────────────────────────────────────

function registerIpcHandlers(): void {
  const db = getDatabase();
  const bookmarkRepo = new LocalBookmarkRepository(db);
  const tagRepo = new LocalTagRepository(db);

  registerBookmarkHandlers(bookmarkRepo);
  registerTagHandlers(tagRepo);
  registerFileSystemHandlers(bookmarkRepo);
  registerWindowHandlers();
  registerAppHandlers();
}

// ─── Window ───────────────────────────────────────────────────────────────────

function createWindow(): BrowserWindow {
  const savedState = store.get('windowState') as WindowState | undefined;

  const win = new BrowserWindow({
    width: savedState?.width ?? 1200,
    height: savedState?.height ?? 800,
    x: savedState?.x,
    y: savedState?.y,
    minWidth: 800,
    minHeight: 600,
    show: false,
    titleBarStyle: 'hiddenInset', // macOS: keep traffic lights, hide native titlebar
    // icon is used by Windows/Linux; macOS reads it from the .app bundle at package time
    icon: path.join(__dirname, '../../resources/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  // Avoid white flash on startup
  win.on('ready-to-show', () => win.show());

  // Persist window state on close
  win.on('close', () => {
    if (!win.isMinimized() && !win.isMaximized()) {
      const [x, y] = win.getPosition();
      const [width, height] = win.getSize();
      store.set('windowState', { x, y, width, height });
    }
  });

  win.webContents.on('render-process-gone', (_event, details) => {
    console.error('Renderer process gone:', details.reason);
  });

  if (isDev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL']);
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  return win;
}

// ─── App Lifecycle ────────────────────────────────────────────────────────────

app.whenReady().then(async () => {
  const { default: Store } = await import('electron-store');
  store = new Store<{ windowState: WindowState }>();

  try {
    registerIpcHandlers();
  } catch (error) {
    dialog.showErrorBox(
      'Database Error',
      `Failed to initialize the database:\n${(error as Error).message}\n\nThe application will now quit.`,
    );
    app.exit(1);
    return;
  }
  createWindow();

  app.on('activate', () => {
    // macOS: re-create window when dock icon is clicked and no windows are open
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // On macOS, apps typically stay running until Cmd+Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  closeDatabase();
});
