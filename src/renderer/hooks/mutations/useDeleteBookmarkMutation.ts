import { useMutation, useQueryClient } from '@tanstack/react-query';
import { IpcChannels } from '@shared/ipc-channels';
import type { IpcResult } from '@shared/types';
import { queryKeys } from '@renderer/lib/queryKeys';

export function useDeleteBookmarkMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const result = await window.electron.invoke(IpcChannels.BOOKMARK_DELETE, id) as IpcResult;
      if (!result.success) throw new Error(result.error ?? 'Failed to delete bookmark');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookmark.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tag.all });
    },
  });
}
