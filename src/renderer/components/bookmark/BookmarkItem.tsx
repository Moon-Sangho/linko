import { useRef, useState } from 'react';
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
  const { openUrl } = useBookmarkStore();
  const { openEditModal } = useUIStore();
  const [deletePopoverOpen, setDeletePopoverOpen] = useState(false);
  const deleteRef = useRef<HTMLButtonElement>(null);

  const handleDoubleClick = () => {
    openUrl(bookmark.url);
  };

  const handleOpenClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openUrl(bookmark.url);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openEditModal(bookmark.id);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletePopoverOpen(true);
  };

  const formattedDate = new Date(bookmark.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const MAX_VISIBLE_TAGS = 3;
  const visibleTags = bookmark.tags.slice(0, MAX_VISIBLE_TAGS);
  const extraTagCount = bookmark.tags.length - MAX_VISIBLE_TAGS;

  return (
    <div
      className={`
        group relative flex items-center gap-3 py-3 px-4 cursor-pointer
        border-b border-[var(--color-border)] last:border-b-0
        transition-colors duration-[80ms] ease-out
        ${isSelected
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
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-[var(--color-text-primary)] truncate leading-5">
            {bookmark.title ?? bookmark.url}
          </p>
        </div>
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
              {extraTagCount > 0 && (
                <Badge count={extraTagCount} />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Date */}
      <span className="flex-shrink-0 text-xs text-[var(--color-text-tertiary)] hidden group-hover:hidden sm:block">
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
          ref={deleteRef}
          onClick={handleDeleteClick}
          className="p-1.5 rounded text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] hover:bg-[var(--color-bg-overlay)] transition-colors"
          title="Delete"
        >
          <Trash2 size={14} strokeWidth={1.5} />
        </button>
      </div>

      {/* Delete confirm inline */}
      {deletePopoverOpen && (
        <div
          className="absolute right-4 top-full mt-1 z-50 w-60 bg-[var(--color-bg-overlay)] border border-[var(--color-border)] rounded-md shadow-md p-3"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-sm text-[var(--color-text-primary)] mb-3">
            Delete this bookmark? This cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setDeletePopoverOpen(false)}
              className="px-3 py-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              Cancel
            </button>
            <DeleteConfirmButton
              bookmarkId={bookmark.id}
              onDone={() => setDeletePopoverOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function DeleteConfirmButton({ bookmarkId, onDone }: { bookmarkId: number; onDone: () => void }) {
  const { deleteBookmark } = useBookmarkStore();
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await deleteBookmark(bookmarkId);
    } finally {
      setDeleting(false);
      onDone();
    }
  };

  return (
    <button
      onClick={handleConfirm}
      disabled={deleting}
      className="px-3 py-1 text-sm bg-[var(--color-danger)] text-white rounded hover:opacity-90 transition-opacity disabled:opacity-50"
    >
      {deleting ? 'Deleting…' : 'Delete'}
    </button>
  );
}
