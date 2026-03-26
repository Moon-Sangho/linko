import { app, BrowserWindow, dialog } from 'electron';
import path from 'path';
import { is } from '@electron-toolkit/utils';
import { createMainWindow } from '@main/windows/main';
import { getDatabase, closeDatabase } from '@main/db/database';
import { LocalBookmarkRepository } from '@main/db/repositories/bookmark-repository';
import { LocalTagRepository } from '@main/db/repositories/tag-repository';
import { registerBookmarkHandlers } from '@main/ipc/bookmarks';
import { FaviconEnrichmentService } from '@main/services/favicon-enrichment-service';
import { registerTagHandlers } from '@main/ipc/tags';
import { registerWindowHandlers } from '@main/ipc/window';
import { registerFileSystemHandlers } from '@main/ipc/file-system';
import { registerAppHandlers } from '@main/ipc/app';

const windows: Record<string, BrowserWindow | null> = {
  main: null,
};

function resolveUserDataPath(): string {
  return is.dev ? path.join(app.getPath('appData'), 'Linko-Dev') : app.getPath('userData');
}

app.setPath('userData', resolveUserDataPath());

// ─── IPC Handler Registration ─────────────────────────────────────────────────

function registerIpcHandlers(): void {
  const db = getDatabase();
  const bookmarkRepo = new LocalBookmarkRepository(db);
  const tagRepo = new LocalTagRepository(db);
  const faviconEnrichmentService = new FaviconEnrichmentService(bookmarkRepo, () => windows.main);

  registerBookmarkHandlers(bookmarkRepo, faviconEnrichmentService);
  registerTagHandlers(tagRepo);
  registerFileSystemHandlers(bookmarkRepo);
  registerWindowHandlers();
  registerAppHandlers();
}

// ─── App Lifecycle ────────────────────────────────────────────────────────────

app.whenReady().then(async () => {
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
  windows.main = await createMainWindow();

  app.on('activate', async () => {
    // macOS: re-create window when dock icon is clicked and no windows are open
    if (BrowserWindow.getAllWindows().length === 0) {
      windows.main = await createMainWindow();
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
