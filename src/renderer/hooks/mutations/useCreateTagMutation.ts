import { useMutation, useQueryClient } from '@tanstack/react-query';
import { IpcChannels } from '@shared/ipc-channels';
import type { CreateTagInput, IpcResult, Tag } from '@shared/types';
import { queryKeys } from '@renderer/lib/queryKeys';

export function useCreateTagMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateTagInput) => {
      const result = (await window.electron.invoke(
        IpcChannels.TAG_CREATE,
        input,
      )) as IpcResult<Tag>;
      if (!result.success || !result.data) throw new Error(result.error ?? 'Failed to create tag');
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tag.all });
    },
  });
}
