import { useQuery } from '@tanstack/react-query';
import { IpcChannels } from '@shared/ipc-channels';
import type { Bookmark } from '@shared/types/domains';
import { queryKeys } from '@renderer/lib/query-keys';

export function useBookmarkQuery(id: number) {
  return useQuery({
    queryKey: queryKeys.bookmark.byId(id),
    queryFn: () =>
      window.electron.invoke(IpcChannels.BOOKMARK_GET_BY_ID, id) as Promise<Bookmark | null>,
  });
}
