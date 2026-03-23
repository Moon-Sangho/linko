import { useMutation, useQueryClient } from '@tanstack/react-query';
import { IpcChannels } from '@shared/ipc-channels';
import type { Bookmark, IpcResult, UpdateBookmarkInput } from '@shared/types';
import { queryKeys } from '@renderer/lib/query-keys';

export function useUpdateBookmarkMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: number; input: UpdateBookmarkInput }) => {
      const result = (await window.electron.invoke(
        IpcChannels.BOOKMARK_UPDATE,
        id,
        input,
      )) as IpcResult<Bookmark>;
      if (!result.success || !result.data)
        throw new Error(result.error ?? 'Failed to update bookmark');
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookmark.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tag.all });
    },
  });
}
