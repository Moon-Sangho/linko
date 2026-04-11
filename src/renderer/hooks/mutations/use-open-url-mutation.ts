import { useMutation } from '@tanstack/react-query';
import { IpcChannels } from '@shared/ipc-channels';

interface OpenUrlInput {
  id: string;
  url: string;
}

export function useOpenUrlMutation() {
  return useMutation({
    mutationFn: ({ id, url }: OpenUrlInput) =>
      window.electron.invoke(IpcChannels.BOOKMARK_OPEN, id, url),
  });
}
