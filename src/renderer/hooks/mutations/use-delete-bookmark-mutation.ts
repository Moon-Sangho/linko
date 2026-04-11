import { useMutation, useQueryClient } from '@tanstack/react-query';
import { IpcChannels } from '@shared/ipc-channels';
import type { IpcResult } from '@shared/types/domains';
import { queryKeys } from '@renderer/lib/query-keys';

export function useDeleteBookmarkMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const result = (await window.electron.invoke(IpcChannels.BOOKMARK_DELETE, id)) as IpcResult;
      if (!result.success) throw new Error(result.error ?? 'Failed to delete bookmark');
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookmark.all });
      queryClient.removeQueries({ queryKey: queryKeys.bookmark.byId(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tag.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.sync.all });
    },
  });
}
