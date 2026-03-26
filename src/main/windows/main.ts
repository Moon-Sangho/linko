import { BrowserWindow } from 'electron';
import path from 'path';
import { is } from '@electron-toolkit/utils';
import type { WindowState } from '@shared/types/domains';

export async function createMainWindow(): Promise<BrowserWindow> {
  const { default: Store } = await import('electron-store');
  const store = new Store<{ windowState: WindowState }>();
  const savedState = store.get('windowState') as WindowState | undefined;

  const win = new BrowserWindow({
    width: savedState?.width ?? 1200,
    height: savedState?.height ?? 800,
    x: savedState?.x,
    y: savedState?.y,
    minWidth: 800,
    minHeight: 600,
    show: false,
    titleBarStyle: 'hiddenInset',
    icon: path.join(__dirname, '../../resources/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  win.on('ready-to-show', () => win.show());

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

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL']);
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  return win;
}
