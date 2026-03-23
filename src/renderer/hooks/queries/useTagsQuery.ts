import { useQuery } from '@tanstack/react-query';
import { IpcChannels } from '@shared/ipc-channels';
import type { IpcResult, Tag } from '@shared/types';
import { queryKeys } from '@renderer/lib/queryKeys';

export function useTagsQuery() {
  return useQuery({
    queryKey: queryKeys.tag.all,
    queryFn: async () => {
      const result = (await window.electron.invoke(IpcChannels.TAGS_GET_ALL)) as IpcResult<Tag[]>;
      if (!result.success) throw new Error(result.error ?? 'Failed to fetch tags');
      return result.data!;
    },
  });
}
