import { useMutation, useQueryClient } from '@tanstack/react-query';
import { IpcChannels } from '@shared/ipc-channels';
import type { IpcResult } from '@shared/types/domains';
import { queryKeys } from '@renderer/lib/query-keys';

export function usePushMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const result = (await window.electron.invoke(IpcChannels.SYNC_PUSH)) as IpcResult<void>;
      if (!result.success) throw new Error(result.error ?? 'Push failed');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sync.all });
    },
  });
}
