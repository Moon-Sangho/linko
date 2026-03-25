import { useEffect, useMemo, useState } from 'react';
import type { SearchBookmarksInput } from '@shared/types';
import { useUIStore } from '@renderer/store/use-ui-store';
import { useSearchQuery } from '@renderer/hooks/queries/use-search-bookmark-query';
import { debounce } from '@renderer/utils/debounce';

const QUERY_DEBOUNCE_MS = 1000;

/**
 * Server-side FTS search via BOOKMARKS_SEARCH IPC.
 * Debounces the text query. Tag selection is always instant.
 */
export function useSearchBookmark() {
  const { searchQuery, setSearchQuery, selectedTagIds } = useUIStore();

  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  const updateDebouncedQuery = useMemo(
    () => debounce(setDebouncedQuery, { delay: QUERY_DEBOUNCE_MS }),
    [],
  );

  useEffect(() => {
    updateDebouncedQuery(searchQuery);
  }, [searchQuery, updateDebouncedQuery]);

  // tagIds are always live — not debounced
  const debouncedInput: SearchBookmarksInput = { query: debouncedQuery, tagIds: selectedTagIds };

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
