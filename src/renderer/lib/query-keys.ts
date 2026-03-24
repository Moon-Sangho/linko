import type { SearchBookmarksInput } from '@shared/types';

export const queryKeys = {
  bookmark: {
    all: ['bookmarks'] as const,
    searches: ['bookmarks', 'search'] as const,
    search: (input: SearchBookmarksInput) => ['bookmarks', 'search', input] as const,
  },
  tag: {
    all: ['tags'] as const,
  },
} as const;
