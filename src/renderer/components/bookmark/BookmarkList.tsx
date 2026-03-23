import { useCallback, useEffect, useRef, useState } from 'react';
import { Bookmark, SearchX } from 'lucide-react';
import { useBookmarksQuery } from '@renderer/hooks/queries/useBookmarksQuery';
import { useDeleteBulkBookmarksMutation } from '@renderer/hooks/mutations/useDeleteBulkBookmarksMutation';
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
  const { data: bookmarks = [], isLoading } = useBookmarksQuery();
  const deleteBulkMutation = useDeleteBulkBookmarksMutation();

  const selectedTagIds = useUIStore((s) => s.selectedTagIds);

  const [selectedBookmarkId, setSelectedBookmark] = useState<number | null>(null);
  const [checkedBookmarkIds, setCheckedBookmarkIds] = useState<number[]>([]);

  const toggleBookmarkCheck = useCallback((id: number) => {
    setCheckedBookmarkIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const checkAllBookmarks = useCallback((ids: number[]) => {
    setCheckedBookmarkIds(ids);
  }, []);

  const checkRangeBookmarks = useCallback((ids: number[], checked: boolean) => {
    setCheckedBookmarkIds((prev) =>
      checked
        ? [...new Set([...prev, ...ids])]
        : prev.filter((x) => !ids.includes(x)),
    );
  }, []);

  const clearChecked = useCallback(() => setCheckedBookmarkIds([]), []);

  const isSelectionMode = checkedBookmarkIds.length > 0;
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const lastCheckedIndexRef = useRef<number | null>(null);

  const { searchResults, isSearching, searchQuery } = useSearch();

  const isSearchActive = searchQuery !== '' || selectedTagIds.length > 0;
  const displayBookmarks = isSearchActive ? searchResults : bookmarks;
  const showLoading = isSearchActive ? isSearching : isLoading;

  useEffect(() => {
    if (checkedBookmarkIds.length === 0) {
      lastCheckedIndexRef.current = null;
    }
  }, [checkedBookmarkIds.length]);

  const handleCheckToggle = useCallback(
    (id: number, e: React.MouseEvent) => {
      const currentIndex = displayBookmarks.findIndex((b) => b.id === id);
      if (e.shiftKey && lastCheckedIndexRef.current !== null) {
        const start = Math.min(lastCheckedIndexRef.current, currentIndex);
        const end = Math.max(lastCheckedIndexRef.current, currentIndex);
        const rangeIds = displayBookmarks.slice(start, end + 1).map((b) => b.id);
        const willBeChecked = !checkedBookmarkIds.includes(id);
        checkRangeBookmarks(rangeIds, willBeChecked);
      } else {
        toggleBookmarkCheck(id);
      }
      lastCheckedIndexRef.current = currentIndex;
    },
    [displayBookmarks, checkedBookmarkIds, checkRangeBookmarks, toggleBookmarkCheck],
  );

  const openAddModal = () => {
    overlay.open(({ isOpen, close }) => (
      <AddBookmarkModal isOpen={isOpen} onClose={close} />
    ));
  };

  const handleBulkDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteBulkMutation.mutateAsync(checkedBookmarkIds);
      clearChecked();
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    const isMac = window.electron.platform === 'darwin';
    const handler = (e: KeyboardEvent) => {
      const modifier = isMac ? e.metaKey : e.ctrlKey;
      if (modifier && e.key === 'a') {
        e.preventDefault();
        checkAllBookmarks(displayBookmarks.map((b) => b.id));
        return;
      }
      if (e.key === 'Escape' && isSelectionMode) {
        e.preventDefault();
        clearChecked();
        return;
      }
      if (modifier && e.key === 'Backspace' && isSelectionMode) {
        e.preventDefault();
        setShowDeleteModal(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isSelectionMode, displayBookmarks, checkAllBookmarks, clearChecked]);

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
            isChecked={checkedBookmarkIds.includes(bookmark.id)}
            isSelectionMode={isSelectionMode}
            onClick={() => setSelectedBookmark(bookmark.id)}
            onCheckToggle={handleCheckToggle}
          />
        ))}
      </div>
      {isSelectionMode && (
        <BulkActionBar
          selectedCount={checkedBookmarkIds.length}
          totalCount={displayBookmarks.length}
          isDeleting={isDeleting}
          onSelectAll={() => checkAllBookmarks(displayBookmarks.map((b) => b.id))}
          onDeselectAll={clearChecked}
          onDeleteRequest={() => setShowDeleteModal(true)}
          onClear={clearChecked}
        />
      )}
      <BulkDeleteModal
        isOpen={showDeleteModal}
        count={checkedBookmarkIds.length}
        isDeleting={isDeleting}
        onConfirm={handleBulkDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </>
  );
}
