import { ipcMain, BrowserWindow } from 'electron';
import { IpcChannels } from '@shared/ipc-channels';
import type { IpcResult } from '@shared/types';

export function registerWindowHandlers(): void {
  ipcMain.handle(IpcChannels.WINDOW_MINIMIZE, (): IpcResult => {
    BrowserWindow.getFocusedWindow()?.minimize();
    return { success: true };
  });

  ipcMain.handle(IpcChannels.WINDOW_MAXIMIZE, (): IpcResult => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
      win.isMaximized() ? win.restore() : win.maximize();
    }
    return { success: true };
  });

  ipcMain.handle(IpcChannels.WINDOW_CLOSE, (): IpcResult => {
    BrowserWindow.getFocusedWindow()?.close();
    return { success: true };
  });
}
