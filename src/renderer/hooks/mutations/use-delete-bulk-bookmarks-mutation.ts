import { useMutation, useQueryClient } from '@tanstack/react-query';
import { IpcChannels } from '@shared/ipc-channels';
import type { IpcResult } from '@shared/types';
import { queryKeys } from '@renderer/lib/query-keys';

export function useDeleteBulkBookmarksMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: number[]) => {
      const results = await Promise.all(
        ids.map(
          (id) => window.electron.invoke(IpcChannels.BOOKMARK_DELETE, id) as Promise<IpcResult>,
        ),
      );
      const failed = results.filter((r) => !r.success);
      if (failed.length > 0) throw new Error('Failed to delete some bookmarks');
    },
    onSettled: () => {
      // Refetch regardless — partial failure leaves the DB in an unknown state
      queryClient.invalidateQueries({ queryKey: queryKeys.bookmark.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookmark.searches });
      queryClient.invalidateQueries({ queryKey: queryKeys.tag.all });
    },
  });
}
