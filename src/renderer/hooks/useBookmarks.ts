import { useEffect, useMemo } from 'react';
import { useBookmarkStore } from '../store/useBookmarkStore';
import { useTagStore } from '../store/useTagStore';
import { useUIStore } from '../store/useUIStore';
import type { Bookmark, CreateBookmarkInput, UpdateBookmarkInput } from '../../shared/types';

export function useBookmarks() {
  const { bookmarks, isLoading, error, fetchAll, create, update, delete: deleteBookmark, openUrl } = useBookmarkStore();
  const { fetchAll: fetchTags } = useTagStore();
  const { searchQuery, selectedTagIds } = useUIStore();

  useEffect(() => {
    fetchAll();
    fetchTags();
  }, []);

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
    create: (input: CreateBookmarkInput) => create(input),
    update: (id: number, input: UpdateBookmarkInput) => update(id, input),
    delete: (id: number) => deleteBookmark(id),
    openUrl: (id: number) => openUrl(id),
    refetch: fetchAll,
  };
}
