import { ipcMain, dialog } from 'electron';
import { IpcChannels } from '@shared/ipc-channels';
import type { ImportSummary, IpcResult } from '@shared/types';
import type { BookmarkRepository } from '../db/repositories/bookmark-repository';
import { importFromHtmlFile } from '../services/importer';
import fs from 'fs/promises';

export function registerFileSystemHandlers(bookmarkRepo: BookmarkRepository): void {
  ipcMain.handle(IpcChannels.FS_IMPORT_BOOKMARKS, async (): Promise<IpcResult<ImportSummary>> => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: 'Import Bookmarks',
      filters: [{ name: 'HTML Bookmark File', extensions: ['html', 'htm'] }],
      properties: ['openFile'],
    });

    if (canceled || filePaths.length === 0) {
      return { success: false, error: 'No file selected' };
    }

    try {
      const summary = await importFromHtmlFile(filePaths[0], bookmarkRepo);
      return { success: true, data: summary };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle(
    IpcChannels.FS_EXPORT_BOOKMARKS,
    async (_, bookmarks: unknown): Promise<IpcResult> => {
      if (!Array.isArray(bookmarks)) {
        return { success: false, error: 'Invalid bookmarks payload' };
      }
      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Export Bookmarks',
        defaultPath: 'linko-bookmarks.json',
        filters: [{ name: 'JSON', extensions: ['json'] }],
      });

      if (canceled || !filePath) {
        return { success: false, error: 'No destination selected' };
      }

      try {
        await fs.writeFile(filePath, JSON.stringify(bookmarks, null, 2), 'utf-8');
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    },
  );
}
