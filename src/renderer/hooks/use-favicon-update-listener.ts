import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { InfiniteData } from '@tanstack/react-query';
import { IpcEventChannels } from '@shared/ipc-channels';
import type { Bookmark, BookmarkPage } from '@shared/types/domains';
import { queryKeys } from '@renderer/lib/query-keys';

export function useFaviconUpdateListener(): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handler = ({ id, favicon_url }: { id: number; favicon_url: string }) => {
      queryClient.setQueriesData<InfiniteData<BookmarkPage>>(
        { queryKey: queryKeys.bookmark.all },
        (old) => {
          if (!old || !('pages' in old)) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              results: page.results.map((b) =>
                b.id === id ? { ...b, favicon_url } : b,
              ),
            })),
          };
        },
      );

      queryClient.setQueryData<Bookmark>(
        queryKeys.bookmark.byId(id),
        (old) => (old ? { ...old, favicon_url } : old),
      );
    };

    window.electron.on(IpcEventChannels.BOOKMARK_FAVICON_UPDATED, handler);

    return () => {
      window.electron.off(IpcEventChannels.BOOKMARK_FAVICON_UPDATED, handler);
    };
  }, [queryClient]);
}
