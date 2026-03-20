import { useEffect, useMemo } from 'react';
import { useBookmarkStore } from '../store/useBookmarkStore';
import { useTagStore } from '../store/useTagStore';
import { useUIStore } from '../store/useUIStore';
import type { Bookmark } from '@shared/types';

/**
 * Primary hook for the bookmark list view.
 * Provides the full bookmark list with client-side filtering by searchQuery and selectedTagIds.
 * For server-side FTS ranked results, use useSearch instead.
 */
export function useBookmarks() {
  const { bookmarks, isLoading, error, fetchAll, create, update, removeBookmark, openUrl } = useBookmarkStore();
  const { fetchAll: fetchTags } = useTagStore();
  const { searchQuery, selectedTagIds } = useUIStore();

  useEffect(() => {
    fetchAll();
    fetchTags();
  }, [fetchAll, fetchTags]);

  const filteredBookmarks = useMemo<Bookmark[]>(() => {
    let result = bookmarks;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(b =>
        b.url.toLowerCase().includes(q) ||
        (b.title?.toLowerCase().includes(q) ?? false) ||
        (b.notes?.toLowerCase().includes(q) ?? false)
      );
    }

    if (selectedTagIds.length > 0) {
      result = result.filter(b =>
        selectedTagIds.every(tagId => b.tags.some(t => t.id === tagId))
      );
    }

    return result;
  }, [bookmarks, searchQuery, selectedTagIds]);

  return {
    bookmarks,
    filteredBookmarks,
    isLoading,
    error,
    create,
    update,
    delete: removeBookmark,
    openUrl,
    refetch: fetchAll,
  };
}
