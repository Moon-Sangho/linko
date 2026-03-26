import type { IpcChannel, IpcEventChannel, IpcEventPayloadMap } from '@shared/ipc-channels';

declare global {
  interface Window {
    electron: {
      invoke: (channel: IpcChannel, ...args: unknown[]) => Promise<unknown>;
      on: <C extends IpcEventChannel>(channel: C, callback: (payload: IpcEventPayloadMap[C]) => void) => void;
      off: <C extends IpcEventChannel>(channel: C, callback: (payload: IpcEventPayloadMap[C]) => void) => void;
      platform: NodeJS.Platform;
    };
  }
}

export {};
