import { useMutation } from '@tanstack/react-query';
import { IpcChannels } from '@shared/ipc-channels';

export function useOpenUrlMutation() {
  return useMutation({
    mutationFn: (url: string) => window.electron.invoke(IpcChannels.BOOKMARK_OPEN, url),
  });
}
