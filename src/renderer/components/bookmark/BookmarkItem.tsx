import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { Bookmark } from '../../../shared/types';
import { useBookmarkStore } from '../../store/useBookmarkStore';
import { useUIStore } from '../../store/useUIStore';
import { Favicon } from '../ui/Favicon';
import { Badge } from '../ui/Badge';

interface BookmarkItemProps {
  bookmark: Bookmark;
  isSelected: boolean;
  onClick: () => void;
}

export function BookmarkItem({ bookmark, isSelected, onClick }: BookmarkItemProps) {
  // Select only the needed actions to avoid re-renders on unrelated store changes
  const openUrl = useBookmarkStore((s) => s.openUrl);
  const deleteBookmark = useBookmarkStore((s) => s.deleteBookmark);
  const openEditModal = useUIStore((s) => s.openEditModal);

  const [deletePopoverOpen, setDeletePopoverOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);

  // M4: Close popover on outside click or Escape
  useEffect(() => {
    if (!deletePopoverOpen) return;

    function handleOutsideClick(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setDeletePopoverOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setDeletePopoverOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [deletePopoverOpen]);

  // m3: Memoize formatted date — avoids recomputing on every render
  const formattedDate = useMemo(
    () =>
      new Date(bookmark.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
    [bookmark.created_at],
  );

  const MAX_VISIBLE_TAGS = 3;
  const visibleTags = bookmark.tags.slice(0, MAX_VISIBLE_TAGS);
  const extraTagCount = bookmark.tags.length - MAX_VISIBLE_TAGS;

  const handleDoubleClick = useCallback(() => {
    openUrl(bookmark.url);
  }, [openUrl, bookmark.url]);

  const handleOpenClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      openUrl(bookmark.url);
    },
    [openUrl, bookmark.url],
  );

  const handleEditClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      openEditModal(bookmark.id);
    },
    [openEditModal, bookmark.id],
  );

  const handleDeleteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteError('');
    setDeletePopoverOpen(true);
  }, []);

  // C2: Inline delete — success path unmounts this item, so no state update needed.
  // Failure path re-enables the button and shows an error.
  const handleDeleteConfirm = useCallback(async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteBookmark(bookmark.id);
      // On success the store removes this bookmark → BookmarkList unmounts us.
      // No state updates here; they would be no-ops at best.
    } catch {
      setDeleting(false);
      setDeleteError('Failed to delete. Try again.');
    }
  }, [deleteBookmark, bookmark.id]);

  return (
    <div
      className={`
        group relative flex items-center gap-3 py-3 px-4 cursor-pointer
        border-b border-[var(--color-border)] last:border-b-0
        transition-colors duration-[80ms] ease-out
        ${
          isSelected
            ? 'bg-[var(--color-bg-elevated)] border-l-2 border-l-[var(--color-accent)]'
            : 'hover:bg-[var(--color-bg-elevated)]'
        }
      `}
      onClick={onClick}
      onDoubleClick={handleDoubleClick}
    >
      {/* Favicon */}
      <div className="flex-shrink-0">
        <Favicon src={bookmark.favicon_url ?? undefined} size={16} />
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--color-text-primary)] truncate leading-5">
          {bookmark.title ?? bookmark.url}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-[var(--color-text-secondary)] truncate">
            {bookmark.url}
          </span>
          {visibleTags.length > 0 && (
            <div className="flex items-center gap-1 flex-shrink-0">
              {visibleTags.map((tag) => (
                <span
                  key={tag.id}
                  className="text-xs bg-[var(--color-accent-subtle)] text-[var(--color-accent)] rounded px-1.5 py-0.5"
                >
                  {tag.name}
                </span>
              ))}
              {extraTagCount > 0 && <Badge count={extraTagCount} />}
            </div>
          )}
        </div>
      </div>

      {/* Date — hidden on hover to make room for actions */}
      <span className="flex-shrink-0 text-xs text-[var(--color-text-tertiary)] group-hover:hidden sm:block">
        {formattedDate}
      </span>

      {/* Hover actions */}
      <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-[80ms]">
        <button
          onClick={handleOpenClick}
          className="p-1.5 rounded text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-overlay)] transition-colors"
          title="Open in browser"
        >
          <ExternalLink size={14} strokeWidth={1.5} />
        </button>
        <button
          onClick={handleEditClick}
          className="p-1.5 rounded text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-overlay)] transition-colors"
          title="Edit"
        >
          <Pencil size={14} strokeWidth={1.5} />
        </button>
        <button
          onClick={handleDeleteClick}
          className="p-1.5 rounded text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] hover:bg-[var(--color-bg-overlay)] transition-colors"
          title="Delete"
        >
          <Trash2 size={14} strokeWidth={1.5} />
        </button>
      </div>

      {/* Delete confirm popover — M4: closes on outside-click/Escape via effect */}
      {deletePopoverOpen && (
        <div
          ref={popoverRef}
          className="absolute right-4 top-full mt-1 z-50 w-64 bg-[var(--color-bg-overlay)] border border-[var(--color-border)] rounded-md shadow-md p-3"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-sm text-[var(--color-text-primary)] mb-1">
            Delete this bookmark? This cannot be undone.
          </p>
          {deleteError && (
            <p className="text-xs text-[var(--color-danger)] mb-2">{deleteError}</p>
          )}
          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={() => setDeletePopoverOpen(false)}
              disabled={deleting}
              className="px-3 py-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="px-3 py-1 text-sm bg-[var(--color-danger)] text-white rounded hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
