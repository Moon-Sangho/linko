import { useEffect, useState } from 'react';
import { Bookmark, SearchX } from 'lucide-react';
import { useBookmarkStore } from '@renderer/store/useBookmarkStore';
import { useUIStore } from '@renderer/store/useUIStore';
import { useSearch } from '@renderer/hooks/useSearch';
import { overlay } from '@renderer/overlay/control';
import { AddBookmarkModal } from './AddBookmarkModal';
import { BookmarkItem } from './BookmarkItem';
import { BulkActionBar } from './BulkActionBar';
import { BulkDeleteModal } from './BulkDeleteModal';
import { Spinner } from '@renderer/components/ui/Spinner';
import { EmptyState } from '@renderer/components/ui/EmptyState';

export function BookmarkList() {
  const { bookmarks, isLoading, fetchAll, removeBulk } = useBookmarkStore();
  const { selectedBookmarkId, setSelectedBookmark } = useUIStore();
  const selectedTagIds = useUIStore((s) => s.selectedTagIds);
  const selectedBookmarkIds = useUIStore((s) => s.selectedBookmarkIds);
  const toggleBookmarkSelection = useUIStore((s) => s.toggleBookmarkSelection);
  const selectAllBookmarks = useUIStore((s) => s.selectAllBookmarks);
  const clearSelection = useUIStore((s) => s.clearSelection);

  const isSelectionMode = selectedBookmarkIds.length > 0;
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const openAddModal = () => {
    overlay.open(({ isOpen, close }) => (
      <AddBookmarkModal isOpen={isOpen} onClose={close} />
    ));
  };
  const { searchResults, isSearching, searchQuery } = useSearch();

  const isSearchActive = searchQuery !== '' || selectedTagIds.length > 0;
  const displayBookmarks = isSearchActive ? searchResults : bookmarks;
  const showLoading = isSearchActive ? isSearching : isLoading;

  const handleBulkDelete = async () => {
    setIsDeleting(true);
    try {
      await removeBulk(selectedBookmarkIds);
      clearSelection();
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    const isMac = window.electron.platform === 'darwin';
    const handler = (e: KeyboardEvent) => {
      const modifier = isMac ? e.metaKey : e.ctrlKey;
      if (modifier && e.key === 'a') {
        e.preventDefault();
        selectAllBookmarks(displayBookmarks.map((b) => b.id));
        return;
      }
      if (e.key === 'Escape' && isSelectionMode) {
        e.preventDefault();
        clearSelection();
        return;
      }
      if (modifier && e.key === 'Backspace' && isSelectionMode) {
        e.preventDefault();
        setShowDeleteModal(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isSelectionMode, displayBookmarks, selectAllBookmarks, clearSelection]);

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
    <>
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {displayBookmarks.map((bookmark) => (
          <BookmarkItem
            key={bookmark.id}
            bookmark={bookmark}
            isSelected={selectedBookmarkId === bookmark.id}
            isChecked={selectedBookmarkIds.includes(bookmark.id)}
            isSelectionMode={isSelectionMode}
            onClick={() => setSelectedBookmark(bookmark.id)}
            onCheckToggle={toggleBookmarkSelection}
          />
        ))}
        {isSelectionMode && (
          <BulkActionBar
            selectedCount={selectedBookmarkIds.length}
            totalCount={displayBookmarks.length}
            isDeleting={isDeleting}
            onSelectAll={() => selectAllBookmarks(displayBookmarks.map((b) => b.id))}
            onDeselectAll={clearSelection}
            onDeleteRequest={() => setShowDeleteModal(true)}
            onClear={clearSelection}
          />
        )}
      </div>
      <BulkDeleteModal
        isOpen={showDeleteModal}
        count={selectedBookmarkIds.length}
        isDeleting={isDeleting}
        onConfirm={handleBulkDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </>
  );
}
