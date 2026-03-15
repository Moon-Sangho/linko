import { useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import { useBookmarkStore } from '../../store/useBookmarkStore';
import { useUIStore } from '../../store/useUIStore';
import { BookmarkItem } from './BookmarkItem';
import { Spinner } from '../ui/Spinner';
import { EmptyState } from '../ui/EmptyState';

export function BookmarkList() {
  const { bookmarks, isLoading, selectedBookmarkId, selectBookmark, fetchAll } = useBookmarkStore();
  const { openAddModal } = useUIStore();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Spinner size="md" />
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState
          icon={Bookmark}
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
      {bookmarks.map((bookmark) => (
        <BookmarkItem
          key={bookmark.id}
          bookmark={bookmark}
          isSelected={selectedBookmarkId === bookmark.id}
          onClick={() => selectBookmark(bookmark.id)}
        />
      ))}
    </div>
  );
}
