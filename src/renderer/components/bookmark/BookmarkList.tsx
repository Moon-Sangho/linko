import { useEffect } from 'react';
import { Bookmark, SearchX } from 'lucide-react';
import { useBookmarkStore } from '../../store/useBookmarkStore';
import { useUIStore } from '../../store/useUIStore';
import { useSearch } from '../../hooks/useSearch';
import { BookmarkItem } from './BookmarkItem';
import { Spinner } from '../ui/Spinner';
import { EmptyState } from '../ui/EmptyState';

export function BookmarkList() {
  const { bookmarks, isLoading, fetchAll } = useBookmarkStore();
  const { openAddModal, selectedBookmarkId, setSelectedBookmark } = useUIStore();
  const selectedTagIds = useUIStore((s) => s.selectedTagIds);
  const { searchResults, isSearching, searchQuery } = useSearch();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const isSearchActive = searchQuery !== '' || selectedTagIds.length > 0;
  const displayBookmarks = isSearchActive ? searchResults : bookmarks;
  const showLoading = isSearchActive ? isSearching : isLoading;

  if (showLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Spinner size="md" />
      </div>
    );
  }

  if (displayBookmarks.length === 0) {
    if (isSearchActive) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            icon={<SearchX size={20} />}
            title="No results"
            description="Try a different search term or clear the filter."
          />
        </div>
      );
    }
    return (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState
          icon={<Bookmark size={20} />}
          title="No bookmarks yet"
          description="Add your first bookmark to get started."
          action={{
            label: 'Add bookmark',
            onClick: openAddModal,
            shortcut: '⌘N',
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {displayBookmarks.map((bookmark) => (
        <BookmarkItem
          key={bookmark.id}
          bookmark={bookmark}
          isSelected={selectedBookmarkId === bookmark.id}
          onClick={() => setSelectedBookmark(bookmark.id)}
        />
      ))}
    </div>
  );
}
