import { useCallback, useEffect, useState } from 'react';
import { useBookmarksQuery } from '@renderer/hooks/queries/use-bookmarks-query';
import { useUpdateBookmarkMutation } from '@renderer/hooks/mutations/use-update-bookmark-mutation';
import { useDeleteBookmarkMutation } from '@renderer/hooks/mutations/use-delete-bookmark-mutation';
import { useBookmarkForm } from '@renderer/hooks/use-bookmark-form';
import { Spinner } from '@renderer/components/ui/spinner';
import { BookmarkFormModal } from './bookmark-form-modal';

interface EditBookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarkId: number;
}

export function EditBookmarkModal({ isOpen, onClose, bookmarkId }: EditBookmarkModalProps) {
  const { data: bookmark = null } = useBookmarksQuery(
    (bookmarks) => bookmarks.find((b) => b.id === bookmarkId) ?? null,
  );
  const { mutateAsync: updateBookmark } = useUpdateBookmarkMutation();
  const { mutateAsync: deleteBookmark } = useDeleteBookmarkMutation();

  const form = useBookmarkForm();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    if (isOpen && bookmark) {
      form.prefill({
        url: bookmark.url,
        title: bookmark.title ?? '',
        notes: bookmark.notes ?? '',
        tagIds: bookmark.tags.map((t) => t.id),
      });
      setShowDeleteConfirm(false);
      setIsDeleting(false);
      setDeleteError('');
    }
    // form.prefill is stable (useCallback in useBookmarkForm); form object excluded intentionally
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, bookmark, form.prefill]);

  const handleSave = form.handleSubmit(async (data) => {
    if (!bookmark) return;
    try {
      await updateBookmark({
        id: bookmark.id,
        input: {
          url: data.url,
          title: data.title || null,
          notes: data.notes || null,
          tagIds: form.selectedTagIds,
        },
      });
      onClose();
    } catch {
      form.setError('root', { message: 'Failed to save changes. Please try again.' });
    }
  });

  const handleDelete = useCallback(async () => {
    if (!bookmark) return;
    setDeleteError('');
    setIsDeleting(true);
    try {
      await deleteBookmark(bookmark.id);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      onClose();
    } catch {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setDeleteError('Failed to delete bookmark. Please try again.');
    }
  }, [bookmark, deleteBookmark, onClose]);

  if (!bookmark) return null;

  const deleteAction = showDeleteConfirm ? (
    <div className="flex items-center gap-2">
      <span className="text-xs text-[var(--color-text-secondary)]">Are you sure?</span>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="px-3 py-1 text-xs bg-[var(--color-danger)] text-white rounded hover:opacity-90 disabled:opacity-50 flex items-center gap-1"
      >
        {isDeleting && <Spinner size="sm" />}
        Delete
      </button>
      <button
        onClick={() => setShowDeleteConfirm(false)}
        disabled={isDeleting}
        className="px-3 py-1 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors disabled:opacity-50"
      >
        Cancel
      </button>
    </div>
  ) : (
    <button
      onClick={() => setShowDeleteConfirm(true)}
      disabled={isDeleting || form.isSaving}
      className="px-3 py-1.5 text-sm text-[var(--color-danger)] hover:bg-[var(--color-danger-subtle)] rounded transition-colors disabled:opacity-50"
    >
      Delete
    </button>
  );

  return (
    <BookmarkFormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Bookmark"
      form={form}
      onSave={handleSave}
      currentUrl={bookmark.url}
      footerLeft={deleteAction}
      deleteError={deleteError}
      saveDisabled={isDeleting}
    />
  );
}
