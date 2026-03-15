import type { IpcChannel } from '../shared/ipc-channels';

declare global {
  interface Window {
    electron: {
      invoke: (channel: IpcChannel, ...args: unknown[]) => Promise<unknown>;
    };
  }
}

export {};
