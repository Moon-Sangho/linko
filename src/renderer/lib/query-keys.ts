import type { SearchBookmarksInput } from '@shared/types/domains';

export const queryKeys = {
  bookmark: {
    all: ['bookmarks'] as const,
    list: (input: SearchBookmarksInput) => [...queryKeys.bookmark.all, 'list', input] as const,
    byId: (id: string) => [...queryKeys.bookmark.all, 'by-id', id] as const,
  },
  tag: {
    all: ['tags'] as const,
    list: () => [...queryKeys.tag.all, 'list'] as const,
  },
  app: {
    all: ['app'] as const,
    version: () => [...queryKeys.app.all, 'version'] as const,
  },
  sync: {
    all: ['sync'] as const,
    status: () => [...queryKeys.sync.all, 'status'] as const,
    diff: () => [...queryKeys.sync.all, 'diff'] as const,
    config: () => [...queryKeys.sync.all, 'config'] as const,
  },
} as const;
