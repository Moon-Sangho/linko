import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useBookmarkStore } from '../../store/useBookmarkStore';
import { useUIStore } from '../../store/useUIStore';
import { useTagStore } from '../../store/useTagStore';
import { useBookmarkForm } from '../../hooks/useBookmarkForm';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Spinner } from '../ui/Spinner';
import { TagCheckboxList } from '../ui/TagCheckboxList';

export function EditBookmarkModal() {
  const isEditModalOpen = useUIStore((s) => s.isEditModalOpen);
  const selectedBookmarkId = useUIStore((s) => s.selectedBookmarkId);
  const closeEditModal = useUIStore((s) => s.closeEditModal);
  const bookmarks = useBookmarkStore((s) => s.bookmarks);
  const update = useBookmarkStore((s) => s.update);
  const deleteBookmark = useBookmarkStore((s) => s.removeBookmark);
  const tags = useTagStore((s) => s.tags);
  const fetchTags = useTagStore((s) => s.fetchAll);

  // m8: Stable lookup — only re-runs when bookmarks array or selectedId changes
  const bookmark = bookmarks.find((b) => b.id === selectedBookmarkId) ?? null;

  const createTag = useTagStore((s) => s.create);
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
    const tag = await createTag({ name });
    setIsCreatingTag(false);
    setNewTagName('');
    if (tag) form.toggleTag(tag.id);
  }, [newTagName, isCreatingTag, createTag, form]);

  // M2: Pre-fill when modal opens with a valid bookmark. fetchTags is stable.
  useEffect(() => {
    if (isEditModalOpen && bookmark) {
      form.prefill({
        url: bookmark.url,
        title: bookmark.title ?? '',
        notes: bookmark.notes ?? '',
        tagIds: bookmark.tags.map((t) => t.id),
      });
      setShowDeleteConfirm(false);
      setIsDeleting(false);
      setDeleteError('');
      fetchTags();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditModalOpen, bookmark?.id, fetchTags]);

  const handleSave = useCallback(async () => {
    if (!form.url) {
      form.setUrlError('URL is required');
      return;
    }
    if (!form.isValidUrl(form.url)) {
      form.setUrlError('Please enter a valid URL (https:// or http://)');
      return;
    }
    if (!bookmark) return;

    form.setSaveError('');
    form.setIsSaving(true);
    try {
      await update(bookmark.id, {
        url: form.url,
        title: form.title || null,
        notes: form.notes || null,
        tagIds: form.selectedTagIds,
      });
      closeEditModal();
    } catch {
      // M3: Surface error to user
      form.setSaveError('Failed to save changes. Please try again.');
    } finally {
      form.setIsSaving(false);
    }
  }, [form, bookmark, update, closeEditModal]);

  // C3: Reset local state BEFORE calling closeEditModal so no updates happen
  // after the component potentially unmounts.
  const handleDelete = useCallback(async () => {
    if (!bookmark) return;
    setDeleteError('');
    setIsDeleting(true);
    try {
      await deleteBookmark(bookmark.id);
      // Success: reset state then close while component is still mounted
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      closeEditModal();
    } catch {
      // M3: Surface error; keep modal open so user can retry
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setDeleteError('Failed to delete bookmark. Please try again.');
    }
  }, [bookmark, deleteBookmark, closeEditModal]);

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
      isOpen={isEditModalOpen}
      onClose={closeEditModal}
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
              onClick={closeEditModal}
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
        {form.saveError && (
          <div className="flex items-center gap-2 text-xs text-[var(--color-danger)] bg-[var(--color-danger-subtle)] rounded-md px-3 py-2">
            <AlertTriangle size={12} strokeWidth={1.5} />
            {form.saveError}
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
            error={form.urlError}
          />
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
            placeholder={form.isFetchingMeta ? 'Fetching title…' : 'Page title'}
            value={form.title}
            onChange={(e) => form.setTitle(e.target.value)}
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
            value={form.notes}
            onChange={(e) => form.setNotes(e.target.value)}
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
