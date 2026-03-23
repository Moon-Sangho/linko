import { useQuery } from '@tanstack/react-query';
import { IpcChannels } from '@shared/ipc-channels';
import type { Bookmark, IpcResult } from '@shared/types';
import { queryKeys } from '@renderer/lib/queryKeys';

export function useBookmarksQuery<TData = Bookmark[]>(select?: (data: Bookmark[]) => TData) {
  return useQuery({
    queryKey: queryKeys.bookmark.all,
    queryFn: async () => {
      const result = (await window.electron.invoke(IpcChannels.BOOKMARKS_GET_ALL)) as IpcResult<
        Bookmark[]
      >;
      if (!result.success) throw new Error(result.error ?? 'Failed to fetch bookmarks');
      return result.data!;
    },
    select,
  });
}
