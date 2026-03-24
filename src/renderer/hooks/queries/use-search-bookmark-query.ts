import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { IpcChannels } from '@shared/ipc-channels';
import type { Bookmark, SearchBookmarksInput } from '@shared/types';
import { queryKeys } from '@renderer/lib/query-keys';

export function useSearchQuery(input: SearchBookmarksInput) {
  const isActive = !!(input.query?.trim() || input.tagIds?.length);

  return useQuery({
    queryKey: queryKeys.bookmark.search(input),
    queryFn: () =>
      window.electron.invoke(IpcChannels.BOOKMARKS_SEARCH, input) as Promise<Bookmark[]>,
    enabled: isActive,
    placeholderData: keepPreviousData,
  });
}
