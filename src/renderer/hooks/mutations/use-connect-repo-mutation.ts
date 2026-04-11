import { useMutation, useQueryClient } from '@tanstack/react-query';
import { IpcChannels } from '@shared/ipc-channels';
import type { ConnectRepoInput, IpcResult } from '@shared/types/domains';
import { queryKeys } from '@renderer/lib/query-keys';

export function useConnectRepoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ConnectRepoInput) => {
      const result = (await window.electron.invoke(
        IpcChannels.SYNC_CONNECT,
        input,
      )) as IpcResult<void>;
      if (!result.success) throw new Error(result.error ?? 'Failed to connect repository');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sync.all });
    },
  });
}
