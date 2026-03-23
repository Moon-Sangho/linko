import { useMutation, useQueryClient } from '@tanstack/react-query';
import { IpcChannels } from '@shared/ipc-channels';
import type { Bookmark, CreateBookmarkInput, IpcResult } from '@shared/types';
import { queryKeys } from '@renderer/lib/query-keys';

export function useCreateBookmarkMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateBookmarkInput) => {
      const result = (await window.electron.invoke(
        IpcChannels.BOOKMARK_CREATE,
        input,
      )) as IpcResult<Bookmark>;
      if (!result.success || !result.data)
        throw new Error(result.error ?? 'Failed to create bookmark');
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookmark.all });
    },
  });
}
