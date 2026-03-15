import { useEffect } from 'react';
import { useBookmarkStore } from '../store/useBookmarkStore';
import { useUIStore } from '../store/useUIStore';

export function useSearch() {
  const { search, fetchAll } = useBookmarkStore();
  const { searchQuery, selectedTagIds } = useUIStore();

  useEffect(() => {
    const hasQuery = searchQuery.trim().length > 0;
    const hasTags = selectedTagIds.length > 0;

    if (!hasQuery && !hasTags) {
      fetchAll();
      return;
    }

    const timer = setTimeout(() => {
      search({
        query: hasQuery ? searchQuery.trim() : undefined,
        tagIds: hasTags ? selectedTagIds : undefined,
      });
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedTagIds, search, fetchAll]);
}
