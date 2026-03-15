import { ipcMain, app } from 'electron';
import { IpcChannels } from '../../shared/ipc-channels';
import type { IpcResult } from '../../shared/types';

export function registerAppHandlers(): void {
  ipcMain.handle(
    IpcChannels.APP_GET_VERSION,
    (): IpcResult<string> => {
      return { success: true, data: app.getVersion() };
    },
  );
}
