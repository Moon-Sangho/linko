import type { SearchBookmarksInput } from '@shared/types/domains';

export const queryKeys = {
  bookmark: {
    all: ['bookmarks'] as const,
    list: (input: SearchBookmarksInput) => [...queryKeys.bookmark.all, 'list', input] as const,
    byId: (id: number) => [...queryKeys.bookmark.all, 'by-id', id] as const,
  },
  tag: {
    all: ['tags'] as const,
    list: () => [...queryKeys.tag.all, 'list'] as const,
  },
  app: {
    all: ['app'] as const,
    version: () => [...queryKeys.app.all, 'version'] as const,
  },
} as const;
