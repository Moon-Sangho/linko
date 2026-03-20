import { useCallback, useEffect, useRef, useState } from 'react';
import { IpcChannels } from '@shared/ipc-channels';
import type { Bookmark, IpcResult, SearchBookmarksInput } from '@shared/types';
import { useUIStore } from '../store/useUIStore';
import { useBookmarkStore } from '../store/useBookmarkStore';

const DEBOUNCE_MS = 300;

/**
 * Server-side FTS search via BOOKMARKS_SEARCH IPC.
 * Use this when you need ranked/FTS results from SQLite.
 * For simple client-side filtering of the already-loaded list, use useBookmarks instead.
 */
export function useSearch() {
  const { searchQuery, setSearchQuery, selectedTagIds } = useUIStore();
  const bookmarks = useBookmarkStore((s) => s.bookmarks);
  const [searchResults, setSearchResults] = useState<Bookmark[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Monotonic counter to discard results from stale in-flight requests
  const requestIdRef = useRef(0);

  const runSearch = useCallback(async (query: string, tagIds: number[]) => {
    const requestId = ++requestIdRef.current;
    setIsSearching(true);
    setError(null);
    try {
      const input: SearchBookmarksInput = {
        query: query.trim() || undefined,
        tagIds: tagIds.length > 0 ? tagIds : undefined,
      };
      const result = await window.electron.invoke(IpcChannels.BOOKMARKS_SEARCH, input) as IpcResult<Bookmark[]>;
      // Discard if a newer request has already been dispatched
      if (requestId !== requestIdRef.current) return;
      if (result.success && result.data) {
        setSearchResults(result.data);
      } else {
        setError(result.error ?? 'Search failed');
      }
    } catch (err) {
      if (requestId === requestIdRef.current) {
        setError(String(err));
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setIsSearching(false);
      }
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
  }, [searchQuery, selectedTagIds, bookmarks, runSearch]);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    error,
  };
}
