import { useCallback, useEffect, useRef, useState } from 'react';
import { IpcChannels } from '../../shared/ipc-channels';
import type { Bookmark, IpcResult, SearchBookmarksInput } from '../../shared/types';
import { useUIStore } from '../store/useUIStore';

const DEBOUNCE_MS = 300;

export function useSearch() {
  const { searchQuery, setSearchQuery, selectedTagIds } = useUIStore();
  const [searchResults, setSearchResults] = useState<Bookmark[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = useCallback(async (query: string, tagIds: number[]) => {
    setIsSearching(true);
    try {
      const input: SearchBookmarksInput = {
        query: query.trim() || undefined,
        tagIds: tagIds.length > 0 ? tagIds : undefined,
      };
      const result = await window.electron.invoke(IpcChannels.BOOKMARKS_SEARCH, input) as IpcResult<Bookmark[]>;
      if (result.success && result.data) {
        setSearchResults(result.data);
      }
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      runSearch(searchQuery, selectedTagIds);
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [searchQuery, selectedTagIds, runSearch]);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
  };
}
