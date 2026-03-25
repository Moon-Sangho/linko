import { useMutation } from '@tanstack/react-query';
import { IpcChannels } from '@shared/ipc-channels';
import type { IpcResult, UrlMetadata } from '@shared/types';

export function useFetchUrlMetadataMutation() {
  return useMutation({
    mutationFn: async (url: string) => {
      const result = (await window.electron.invoke(
        IpcChannels.BOOKMARK_FETCH_METADATA,
        url,
      )) as IpcResult<UrlMetadata>;
      if (!result.success || !result.data) throw new Error(result.error ?? 'Failed to fetch metadata');
      return result.data;
    },
  });
}
