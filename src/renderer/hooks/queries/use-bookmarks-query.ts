import { useQuery } from '@tanstack/react-query';
import { IpcChannels } from '@shared/ipc-channels';
import type { Bookmark } from '@shared/types';
import { queryKeys } from '@renderer/lib/query-keys';

export function useBookmarksQuery<TData = Bookmark[]>(select?: (data: Bookmark[]) => TData) {
  return useQuery({
    queryKey: queryKeys.bookmark.all,
    queryFn: () => window.electron.invoke(IpcChannels.BOOKMARKS_GET_ALL) as Promise<Bookmark[]>,
    select,
  });
}
