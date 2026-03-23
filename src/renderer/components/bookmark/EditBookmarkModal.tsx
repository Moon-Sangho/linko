import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useBookmarksQuery } from '@renderer/hooks/queries/useBookmarksQuery';
import { useTagsQuery } from '@renderer/hooks/queries/useTagsQuery';
import { useUpdateBookmarkMutation } from '@renderer/hooks/mutations/useUpdateBookmarkMutation';
import { useDeleteBookmarkMutation } from '@renderer/hooks/mutations/useDeleteBookmarkMutation';
import { useCreateTagMutation } from '@renderer/hooks/mutations/useCreateTagMutation';
import { useBookmarkForm } from '@renderer/hooks/useBookmarkForm';
import { Modal } from '@renderer/components/ui/Modal';
import { Input } from '@renderer/components/ui/Input';
import { Spinner } from '@renderer/components/ui/Spinner';
import { TagCheckboxList } from '@renderer/components/ui/TagCheckboxList';
interface EditBookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarkId: number;
}

export function EditBookmarkModal({ isOpen, onClose, bookmarkId }: EditBookmarkModalProps) {
  const { data: bookmark = null } = useBookmarksQuery(
    (bookmarks) => bookmarks.find((b) => b.id === bookmarkId) ?? null,
  );
  const updateMutation = useUpdateBookmarkMutation();
  const deleteMutation = useDeleteBookmarkMutation();
  const { data: tags = [] } = useTagsQuery();
  const createTag = useCreateTagMutation();

  const form = useBookmarkForm();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [isCreatingTag, setIsCreatingTag] = useState(false);

  const handleCreateTag = useCallback(async () => {
    const name = newTagName.trim();
    if (!name || isCreatingTag) return;
    setIsCreatingTag(true);
    try {
      const tag = await createTag.mutateAsync({ name });
      if (tag) form.toggleTag(tag.id);
    } finally {
      setIsCreatingTag(false);
      setNewTagName('');
    }
  }, [newTagName, isCreatingTag, createTag, form]);

  // M2: Pre-fill when modal opens with a valid bookmark.
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, bookmark?.id]);

  const handleSave = form.handleSubmit(async (data) => {
    if (!bookmark) return;
    try {
      await updateMutation.mutateAsync({
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
      // M3: Surface error to user
      form.setError('root', { message: 'Failed to save changes. Please try again.' });
    }
  });

  // C3: Reset local state BEFORE calling onClose so no updates happen
  // after the component potentially unmounts.
  const handleDelete = useCallback(async () => {
    if (!bookmark) return;
    setDeleteError('');
    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync(bookmark.id);
      // Success: reset state then close while component is still mounted
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      onClose();
    } catch {
      // M3: Surface error; keep modal open so user can retry
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setDeleteError('Failed to delete bookmark. Please try again.');
    }
  }, [bookmark, deleteMutation, onClose]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        handleSave();
      }
    },
    [handleSave],
  );

  const canSave = form.canSave && !isDeleting;

  if (!bookmark) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Bookmark"
      width={520}
      footer={
        <div className="flex items-center justify-between">
          {/* Delete — two-step confirm */}
          <div>
            {showDeleteConfirm ? (
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
            )}
          </div>

          {/* Save / Cancel */}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!canSave}
              className="px-4 py-2 text-sm bg-[var(--color-accent)] text-white rounded-md hover:bg-[var(--color-accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {form.isSaving && <Spinner size="sm" />}
              Save
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4" onKeyDown={handleKeyDown}>
        {/* Save error banner */}
        {form.formState.errors.root && (
          <div className="flex items-center gap-2 text-xs text-[var(--color-danger)] bg-[var(--color-danger-subtle)] rounded-md px-3 py-2">
            <AlertTriangle size={12} strokeWidth={1.5} />
            {form.formState.errors.root.message}
          </div>
        )}

        {/* Delete error banner */}
        {deleteError && (
          <div className="flex items-center gap-2 text-xs text-[var(--color-danger)] bg-[var(--color-danger-subtle)] rounded-md px-3 py-2">
            <AlertTriangle size={12} strokeWidth={1.5} />
            {deleteError}
          </div>
        )}

        {/* URL */}
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
            URL <span className="text-[var(--color-danger)]">*</span>
          </label>
          <Input
            type="url"
            placeholder="https://example.com"
            value={form.url}
            onChange={(e) => form.handleUrlChange(e.target.value)}
            onBlur={() => form.handleUrlBlur(bookmark.url)}
            error={form.formState.errors.url?.message}
          />
          {form.suggestedUrl && (
            <div className="mt-1.5 text-xs text-[var(--color-text-secondary)]">
              Did you mean{' '}
              <button
                type="button"
                onClick={() => form.applySuggestion(bookmark.url)}
                className="text-[var(--color-accent)] hover:underline font-medium"
              >
                {form.suggestedUrl}
              </button>
              ?
            </div>
          )}
          {form.isDuplicate && (
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[var(--color-warning)]">
              <AlertTriangle size={12} strokeWidth={1.5} />
              This URL already exists in another bookmark.
            </div>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
            Title
          </label>
          <Input
            type="text"
            placeholder={form.isFetchingMeta ? 'Fetching title…' : 'Auto-filled from URL'}
            value={form.title}
            onChange={(e) => form.handleTitleChange(e.target.value)}
            disabled={form.isFetchingMeta}
            isLoading={form.isFetchingMeta}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
            Notes
          </label>
          <textarea
            rows={3}
            placeholder="Optional notes…"
            {...form.register('notes')}
            className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-md text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] px-3 py-2 resize-none focus:outline-none focus:border-[var(--color-border-focus)] focus:ring-1 focus:ring-[var(--color-accent)]/20 transition-colors"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
            Tags
          </label>
          {tags.length > 0 && (
            <div className="mb-2">
              <TagCheckboxList
                tags={tags}
                selectedIds={form.selectedTagIds}
                onToggle={form.toggleTag}
              />
            </div>
          )}
          <div className="flex gap-1.5">
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleCreateTag(); } }}
              placeholder="New tag…"
              className="flex-1 h-7 text-xs bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded px-2 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-border-focus)] transition-colors"
            />
            <button
              onClick={handleCreateTag}
              disabled={!newTagName.trim() || isCreatingTag}
              className="h-7 px-2.5 text-xs bg-[var(--color-accent)] text-white rounded hover:bg-[var(--color-accent-hover)] disabled:opacity-40 transition-colors"
            >
              {isCreatingTag ? '…' : '+ Create'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
