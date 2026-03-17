import { contextBridge, ipcRenderer } from 'electron';
import type { IpcChannel } from '../shared/ipc-channels';

/**
 * Expose a minimal IPC bridge to the renderer.
 * The renderer calls window.electron.invoke(channel, ...args) for all data access.
 * No direct Node.js access is granted to the renderer.
 */
contextBridge.exposeInMainWorld('electron', {
  invoke: (channel: IpcChannel, ...args: unknown[]): Promise<unknown> =>
    ipcRenderer.invoke(channel, ...args),
  platform: process.platform,
});
