import { useMutation, useQueryClient } from '@tanstack/react-query';
import { IpcChannels } from '@shared/ipc-channels';
import type { IpcResult, Tag, UpdateTagInput } from '@shared/types/domains';
import { queryKeys } from '@renderer/lib/query-keys';

export function useUpdateTagMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: number; input: UpdateTagInput }) => {
      const result = (await window.electron.invoke(
        IpcChannels.TAG_UPDATE,
        id,
        input,
      )) as IpcResult<Tag>;
      if (!result.success) throw new Error(result.error ?? 'Failed to update tag');
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tag.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookmark.all });
    },
  });
}
