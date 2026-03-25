import { ipcMain, app } from 'electron';
import { IpcChannels } from '@shared/ipc-channels';

export function registerAppHandlers(): void {
  ipcMain.handle(IpcChannels.APP_GET_VERSION, (): string => {
    return app.getVersion();
  });
}
