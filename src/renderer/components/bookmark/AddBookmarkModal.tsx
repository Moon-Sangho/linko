import { useCallback, useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useBookmarkStore } from '../../store/useBookmarkStore';
import { useUIStore } from '../../store/useUIStore';
import { useTagStore } from '../../store/useTagStore';
import { useBookmarkForm } from '../../hooks/useBookmarkForm';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Spinner } from '../ui/Spinner';
import { TagCheckboxList } from '../ui/TagCheckboxList';

export function AddBookmarkModal() {
  const isAddModalOpen = useUIStore((s) => s.isAddModalOpen);
  const closeAddModal = useUIStore((s) => s.closeAddModal);
  const create = useBookmarkStore((s) => s.create);
  const tags = useTagStore((s) => s.tags);
  const fetchTags = useTagStore((s) => s.fetchAll);

  const form = useBookmarkForm();
  const urlRef = useRef<HTMLInputElement>(null);

  // M1: fetchTags and form.reset are stable references — safe in dep array.
  // Using requestAnimationFrame instead of setTimeout for reliable focus (m6 fix).
  useEffect(() => {
    if (isAddModalOpen) {
      form.reset();
      fetchTags();
      requestAnimationFrame(() => urlRef.current?.focus());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAddModalOpen, fetchTags]);

  const handleSave = useCallback(async () => {
    if (!form.url) {
      form.setUrlError('URL is required');
      return;
    }
    if (!form.isValidUrl(form.url)) {
      form.setUrlError('Please enter a valid URL (https:// or http://)');
      return;
    }

    form.setSaveError('');
    form.setIsSaving(true);
    try {
      await create({
        url: form.url,
        title: form.title || null,
        notes: form.notes || null,
        tagIds: form.selectedTagIds,
      });
      closeAddModal();
    } catch {
      // M3: Show error to user instead of silently failing
      form.setSaveError('Failed to save bookmark. Please try again.');
    } finally {
      form.setIsSaving(false);
    }
  }, [form, create, closeAddModal]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        handleSave();
      }
    },
    [handleSave],
  );

  return (
    <Modal
      isOpen={isAddModalOpen}
      onClose={closeAddModal}
      title="Add Bookmark"
      width={520}
      footer={
        <div className="flex justify-end gap-2">
          <button
            onClick={closeAddModal}
            className="px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!form.canSave}
            className="px-4 py-2 text-sm bg-[var(--color-accent)] text-white rounded-md hover:bg-[var(--color-accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {form.isSaving && <Spinner size="sm" />}
            Save
          </button>
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

        {/* URL */}
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
            URL <span className="text-[var(--color-danger)]">*</span>
          </label>
          <Input
            ref={urlRef}
            type="url"
            placeholder="https://example.com"
            value={form.url}
            onChange={(e) => form.handleUrlChange(e.target.value)}
            onBlur={() => form.handleUrlBlur()}
            error={form.urlError}
          />
          {form.isDuplicate && (
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[var(--color-warning)]">
              <AlertTriangle size={12} strokeWidth={1.5} />
              This URL is already in your bookmarks.
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
        {tags.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
              Tags
            </label>
            <TagCheckboxList
              tags={tags}
              selectedIds={form.selectedTagIds}
              onToggle={form.toggleTag}
            />
          </div>
        )}
      </div>
    </Modal>
  );
}
