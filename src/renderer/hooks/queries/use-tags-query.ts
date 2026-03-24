import { useQuery } from '@tanstack/react-query';
import { IpcChannels } from '@shared/ipc-channels';
import type { Tag } from '@shared/types';
import { queryKeys } from '@renderer/lib/query-keys';

export function useTagsQuery() {
  return useQuery({
    queryKey: queryKeys.tag.all,
    queryFn: () => window.electron.invoke(IpcChannels.TAGS_GET_ALL) as Promise<Tag[]>,
  });
}
