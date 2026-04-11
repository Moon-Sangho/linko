import { useInfiniteQuery } from '@tanstack/react-query';
import { IpcChannels } from '@shared/ipc-channels';
import type { BookmarkPage } from '@shared/types/domains';
import { queryKeys } from '@renderer/lib/query-keys';

export const BOOKMARK_PAGE_SIZE = 25;

interface BookmarkListInput {
  query?: string;
  tagIds?: string[];
}

export function useBookmarkListQuery(input: BookmarkListInput) {
  return useInfiniteQuery({
    queryKey: queryKeys.bookmark.list(input),
    queryFn: ({ pageParam }: { pageParam: number }) =>
      window.electron.invoke(IpcChannels.BOOKMARKS_GET_PAGE, {
        ...input,
        limit: BOOKMARK_PAGE_SIZE,
        offset: pageParam,
      }) as Promise<BookmarkPage>,
    initialPageParam: 0,
    getNextPageParam: (lastPage: BookmarkPage, allPages: BookmarkPage[]) =>
      lastPage.hasMore ? allPages.length * BOOKMARK_PAGE_SIZE : undefined,
  });
}
