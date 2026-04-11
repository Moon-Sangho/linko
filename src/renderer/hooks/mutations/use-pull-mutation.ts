import { useMutation, useQueryClient } from '@tanstack/react-query';
import { IpcChannels } from '@shared/ipc-channels';
import type { IpcResult } from '@shared/types/domains';
import { queryKeys } from '@renderer/lib/query-keys';

export function usePullMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const result = (await window.electron.invoke(IpcChannels.SYNC_PULL)) as IpcResult<void>;
      if (!result.success) throw new Error(result.error ?? 'Pull failed');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sync.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookmark.all });
    },
  });
}
