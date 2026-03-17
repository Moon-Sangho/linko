import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useBookmarkStore } from '@renderer/store/useBookmarkStore';
import { useTagStore } from '@renderer/store/useTagStore';
import { useBookmarkForm } from '@renderer/hooks/useBookmarkForm';
import { Modal } from '@renderer/components/ui/Modal';
import { Input } from '@renderer/components/ui/Input';
import { Spinner } from '@renderer/components/ui/Spinner';
import { TagCheckboxList } from '@renderer/components/ui/TagCheckboxList';
import { IpcChannels } from '@shared/ipc-channels';
import type { IpcResult, UrlMetadata } from '@shared/types';

interface AddBookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddBookmarkModal({ isOpen, onClose }: AddBookmarkModalProps) {
  const create = useBookmarkStore((s) => s.create);
  const tags = useTagStore((s) => s.tags);
  const fetchTags = useTagStore((s) => s.fetchAll);
  const createTag = useTagStore((s) => s.create);

  const form = useBookmarkForm();
  const urlRef = useRef<HTMLInputElement>(null);
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

  // M1: fetchTags and form.reset are stable references — safe in dep array.
  // Using requestAnimationFrame instead of setTimeout for reliable focus (m6 fix).
  useEffect(() => {
    if (isOpen) {
      form.reset();
      fetchTags();
      requestAnimationFrame(() => urlRef.current?.focus());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, fetchTags]);

  const handleSave = form.handleSubmit(async (data) => {
    // Cancel any in-flight blur-triggered fetch to avoid racing
    form.cancel();

    // Always fetch metadata to get favicon; prefer form title if already filled
    let title = data.title || null;
    let faviconUrl: string | null = null;

    try {
      const meta = (await window.electron.invoke(
        IpcChannels.BOOKMARK_FETCH_METADATA,
        data.url,
      )) as IpcResult<UrlMetadata>;
      if (meta.success && meta.data) {
        if (!title) title = meta.data.title;
        faviconUrl = meta.data.favicon_url ?? null;
      }
    } catch {
      // Ignore — save without favicon
    }

    try {
      await create({
        url: data.url,
        title,
        notes: data.notes || null,
        favicon_url: faviconUrl,
        tagIds: form.selectedTagIds,
      });
      onClose();
    } catch {
      form.setError('root', { message: 'Failed to save bookmark. Please try again.' });
    }
  });

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
      isOpen={isOpen}
      onClose={onClose}
      title="Add Bookmark"
      width={520}
      footer={
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
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
        {form.formState.errors.root && (
          <div className="flex items-center gap-2 text-xs text-[var(--color-danger)] bg-[var(--color-danger-subtle)] rounded-md px-3 py-2">
            <AlertTriangle size={12} strokeWidth={1.5} />
            {form.formState.errors.root.message}
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
            error={form.formState.errors.url?.message}
          />
          {form.suggestedUrl && (
            <div className="mt-1.5 text-xs text-[var(--color-text-secondary)]">
              Did you mean{' '}
              <button
                type="button"
                onClick={() => form.applySuggestion()}
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
