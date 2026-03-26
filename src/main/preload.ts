import { contextBridge, ipcRenderer } from 'electron';
import type { IpcChannel, IpcEventChannel } from '@shared/ipc-channels';

/**
 * Expose a minimal IPC bridge to the renderer.
 *
 * - invoke: request-response calls to the main process (data access, mutations)
 *     window.electron.invoke(channel, ...args)
 * - on/off: subscribe to one-way push events from the main process (e.g. favicon updates)
 *     window.electron.on(channel, callback)
 *     window.electron.off(channel, callback)
 *
 * No direct Node.js access is granted to the renderer.
 */

// Maps original callbacks to their ipcRenderer wrappers so off() can remove the right function.
const listenerMap = new Map<
  (payload: unknown) => void,
  (event: Electron.IpcRendererEvent, payload: unknown) => void
>();

contextBridge.exposeInMainWorld('electron', {
  invoke: (channel: IpcChannel, ...args: unknown[]): Promise<unknown> =>
    ipcRenderer.invoke(channel, ...args),
  on: (channel: IpcEventChannel, callback: (payload: unknown) => void): void => {
    const wrapper = (_event: Electron.IpcRendererEvent, payload: unknown) =>
      callback(payload);
    listenerMap.set(callback, wrapper);
    ipcRenderer.on(channel, wrapper);
  },
  off: (channel: IpcEventChannel, callback: (payload: unknown) => void): void => {
    const wrapper = listenerMap.get(callback);
    if (wrapper) {
      ipcRenderer.off(channel, wrapper);
      listenerMap.delete(callback);
    }
  },
  platform: process.platform,
});
