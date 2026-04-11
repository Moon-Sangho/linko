import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Bookmark, SearchX } from 'lucide-react';
import { useBookmarkListQuery } from '@renderer/hooks/queries/use-bookmark-list-query';
import { useIntersectionObserver } from '@renderer/hooks/use-intersection-observer';
import { useDeleteBulkBookmarksMutation } from '@renderer/hooks/mutations/use-delete-bulk-bookmarks-mutation';
import { useSearchBookmark } from '@renderer/hooks/use-search-bookmark';
import { overlay } from '@renderer/overlay/control';
import { AddBookmarkModal } from './add-bookmark-modal';
import { BookmarkItem } from './bookmark-item';
import { BulkActionBar } from './bulk-action-bar';
import { BulkDeleteModal } from './bulk-delete-modal';
import { Spinner } from '@renderer/components/ui/spinner';
import { EmptyState } from '@renderer/components/ui/empty-state';

export function BookmarkList() {
  const { searchQuery, selectedTagIds, debouncedQuery } = useSearchBookmark();

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useBookmarkListQuery({ query: debouncedQuery, tagIds: selectedTagIds });

  const deleteBulkMutation = useDeleteBulkBookmarksMutation();

  const displayBookmarks = useMemo(
    () => data?.pages.flatMap((page) => page.results) ?? [],
    [data],
  );

  const [selectedBookmarkId, setSelectedBookmark] = useState<string | null>(null);
  const [checkedBookmarkIds, setCheckedBookmarkIds] = useState<string[]>([]);

  const toggleBookmarkCheck = useCallback((id: string) => {
    setCheckedBookmarkIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const checkAllBookmarks = useCallback((ids: string[]) => {
    setCheckedBookmarkIds(ids);
  }, []);

  const checkRangeBookmarks = useCallback((ids: string[], checked: boolean) => {
    setCheckedBookmarkIds((prev) =>
      checked ? [...new Set([...prev, ...ids])] : prev.filter((x) => !ids.includes(x)),
    );
  }, []);

  const clearChecked = useCallback(() => setCheckedBookmarkIds([]), []);

  const isSelectionMode = checkedBookmarkIds.length > 0;
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const lastCheckedIndexRef = useRef<number | null>(null);

  const sentinelRef = useIntersectionObserver<HTMLDivElement>(fetchNextPage, {
    enabled: hasNextPage && !isFetchingNextPage,
  });

  useEffect(() => {
    if (checkedBookmarkIds.length === 0) {
      lastCheckedIndexRef.current = null;
    }
  }, [checkedBookmarkIds.length]);

  const handleCheckToggle = useCallback(
    (id: string, e: React.MouseEvent) => {
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
    overlay.open(({ isOpen, close }) => <AddBookmarkModal isOpen={isOpen} onClose={close} />);
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

  const isSearchActive = searchQuery !== '' || selectedTagIds.length > 0;

  if (isLoading) {
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
        <div ref={sentinelRef} className="h-1" />
        {isFetchingNextPage && (
          <div className="flex justify-center py-4">
            <Spinner size="sm" />
          </div>
        )}
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
