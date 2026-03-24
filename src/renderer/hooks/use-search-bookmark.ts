import { useEffect, useMemo, useState } from 'react';
import type { SearchBookmarksInput } from '@shared/types';
import { useUIStore } from '@renderer/store/use-ui-store';
import { useSearchQuery } from '@renderer/hooks/queries/use-search-bookmark-query';
import { debounce } from '@renderer/utils/debounce';

const DEBOUNCE_MS = 1000;

/**
 * Server-side FTS search via BOOKMARKS_SEARCH IPC.
 * Debounces the query key and delegates async state to TanStack Query.
 */
export function useSearchBookmark() {
  const { searchQuery, setSearchQuery, selectedTagIds } = useUIStore();

  const [debouncedInput, setDebouncedInput] = useState<SearchBookmarksInput>({
    query: searchQuery,
    tagIds: selectedTagIds,
  });

  const updateDebouncedInput = useMemo(
    () => debounce(setDebouncedInput, { delay: DEBOUNCE_MS }),
    [],
  );

  useEffect(() => {
    updateDebouncedInput({ query: searchQuery, tagIds: selectedTagIds });
  }, [searchQuery, selectedTagIds, updateDebouncedInput]);

  const {
    data: searchResults = [],
    isFetching: isSearching,
    error,
  } = useSearchQuery(debouncedInput);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    error: error?.message ?? null,
  };
}
