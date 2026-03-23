import { useCallback, useMemo, useState } from 'react';
import { Check, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import type { Bookmark } from '@shared/types';
import { useDeleteBookmarkMutation } from '@renderer/hooks/mutations/useDeleteBookmarkMutation';
import { useOpenUrlMutation } from '@renderer/hooks/mutations/useOpenUrlMutation';
import { overlay } from '@renderer/overlay/control';
import { EditBookmarkModal } from './EditBookmarkModal';
import { Favicon } from '@renderer/components/ui/Favicon';
import { Badge } from '@renderer/components/ui/Badge';
import { cn } from '@renderer/lib/cn';

interface BookmarkItemProps {
  bookmark: Bookmark;
  isSelected: boolean;
  isChecked: boolean;
  isSelectionMode: boolean;
  onClick: () => void;
  onCheckToggle: (id: number, e: React.MouseEvent) => void;
}

export function BookmarkItem({
  bookmark,
  isSelected,
  isChecked,
  isSelectionMode,
  onClick,
  onCheckToggle,
}: BookmarkItemProps) {
  const { mutate: openUrl } = useOpenUrlMutation();
  const { mutateAsync: deleteBookmark } = useDeleteBookmarkMutation();

  const [deleteConfirming, setDeleteConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

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
      overlay.open(({ isOpen, close }) => (
        <EditBookmarkModal isOpen={isOpen} onClose={close} bookmarkId={bookmark.id} />
      ));
    },
    [bookmark.id],
  );

  const handleDeleteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteError('');
    setDeleteConfirming(true);
  }, []);

  const handleDeleteCancel = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirming(false);
    setDeleteError('');
  }, []);

  const handleDeleteConfirm = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      setDeleting(true);
      setDeleteError('');
      try {
        await deleteBookmark(bookmark.id);
      } catch {
        setDeleting(false);
        setDeleteError('Failed');
      }
    },
    [deleteBookmark, bookmark.id],
  );

  const handleCheckToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onCheckToggle(bookmark.id, e);
    },
    [onCheckToggle, bookmark.id],
  );

  return (
    <div
      className={cn(
        'group relative flex items-center gap-3 py-3 px-4 cursor-pointer',
        'border-b border-[var(--color-border)] last:border-b-0',
        'transition-colors duration-[80ms] ease-out',
        'border-l-2',
        isChecked ? 'border-l-[var(--color-accent)]' : 'border-l-transparent',
        isChecked
          ? 'bg-[var(--color-accent-subtle)]'
          : isSelected
            ? 'bg-[var(--color-bg-elevated)]'
            : 'hover:bg-[var(--color-bg-elevated)]',
      )}
      onClick={onClick}
      onDoubleClick={handleDoubleClick}
    >
      {/* Checkbox */}
      <button
        onClick={handleCheckToggle}
        onDoubleClick={(e) => e.stopPropagation()}
        className={cn(
          'flex-shrink-0 w-4 h-4 rounded-sm border flex items-center justify-center',
          'transition-opacity duration-[80ms]',
          isSelectionMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
          isChecked
            ? 'bg-[var(--color-accent)] border-[var(--color-accent)]'
            : 'border-gray-600 bg-transparent hover:border-gray-400',
        )}
      >
        {isChecked && <Check size={10} strokeWidth={2.5} className="text-white" />}
      </button>

      {/* Favicon */}
      <div className="flex-shrink-0">
        <Favicon src={bookmark.favicon_url ?? undefined} size={16} />
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
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
              {extraTagCount > 0 && <Badge variant="gray">+{extraTagCount}</Badge>}
            </div>
          )}
          <p className="text-sm font-medium text-[var(--color-text-primary)] truncate leading-5">
            {bookmark.title ?? bookmark.url}
          </p>
        </div>
        <span className="text-xs text-[var(--color-text-secondary)] truncate block mt-0.5">
          {bookmark.url}
        </span>
      </div>

      {/* Date — hidden on hover, in selection mode, or when confirm is active */}
      {!deleteConfirming && !isSelectionMode && (
        <span className="flex-shrink-0 text-xs text-[var(--color-text-tertiary)] group-hover:hidden sm:block">
          {formattedDate}
        </span>
      )}

      {/* Actions — hidden in selection mode */}
      {!isSelectionMode &&
        (deleteConfirming ? (
          <div
            className="flex-shrink-0 flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            {deleteError && <span className="text-xs text-red-400">{deleteError}</span>}
            <span className="text-xs text-gray-400">Delete?</span>
            <button
              onClick={handleDeleteCancel}
              disabled={deleting}
              className="px-2 py-1 text-xs text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-500 transition-colors disabled:opacity-50"
            >
              {deleting ? '…' : 'Delete'}
            </button>
          </div>
        ) : (
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
              className="p-1.5 rounded text-[var(--color-text-secondary)] hover:text-red-400 hover:bg-[var(--color-bg-overlay)] transition-colors"
              title="Delete"
            >
              <Trash2 size={14} strokeWidth={1.5} />
            </button>
          </div>
        ))}
    </div>
  );
}
