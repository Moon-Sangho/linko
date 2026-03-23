import { useCallback, useState } from 'react';
import type { ReactNode, RefObject } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useTagsQuery } from '@renderer/hooks/queries/use-tags-query';
import { useCreateTagMutation } from '@renderer/hooks/mutations/use-create-tag-mutation';
import type { BookmarkFormHandle } from '@renderer/hooks/use-bookmark-form';
import { Modal } from '@renderer/components/ui/modal';
import { Input } from '@renderer/components/ui/input';
import { Spinner } from '@renderer/components/ui/spinner';
import { TagCheckboxList } from '@renderer/components/ui/tag-checkbox-list';

interface BookmarkFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  form: BookmarkFormHandle;
  onSave: () => void;
  /** Pass the bookmark's current URL in edit mode to skip duplicate check on unchanged URL. */
  currentUrl?: string;
  /** Ref forwarded to the URL input — used by add mode to focus on open. */
  urlInputRef?: RefObject<HTMLInputElement | null>;
  /** Slot for the left side of the footer (e.g. delete button in edit mode). */
  footerLeft?: ReactNode;
  /** Error message shown in a banner below save error (e.g. delete failure). */
  deleteError?: string;
  /** Additional disabled condition for the Save button (e.g. while deleting). */
  saveDisabled?: boolean;
}

export function BookmarkFormModal({
  isOpen,
  onClose,
  title,
  form,
  onSave,
  currentUrl,
  urlInputRef,
  footerLeft,
  deleteError,
  saveDisabled,
}: BookmarkFormModalProps) {
  const { data: tags = [] } = useTagsQuery();
  const { mutateAsync: createTag } = useCreateTagMutation();
  const [newTagName, setNewTagName] = useState('');
  const [isCreatingTag, setIsCreatingTag] = useState(false);

  const handleCreateTag = useCallback(async () => {
    const name = newTagName.trim();
    if (!name || isCreatingTag) return;
    setIsCreatingTag(true);
    try {
      const tag = await createTag({ name });
      if (tag) form.toggleTag(tag.id);
    } finally {
      setIsCreatingTag(false);
      setNewTagName('');
    }
    // form.toggleTag is a stable callback reference extracted from the form object
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newTagName, isCreatingTag, createTag, form.toggleTag]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        onSave();
      }
    },
    [onSave],
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      width={520}
      footer={
        <div className="flex items-center justify-between">
          <div>{footerLeft}</div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={!form.canSave || saveDisabled}
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
            ref={urlInputRef}
            type="url"
            placeholder="https://example.com"
            value={form.url}
            onChange={(e) => form.handleUrlChange(e.target.value)}
            onBlur={() => form.handleUrlBlur(currentUrl)}
            error={form.formState.errors.url?.message}
          />
          {form.suggestedUrl && (
            <div className="mt-1.5 text-xs text-[var(--color-text-secondary)]">
              Did you mean{' '}
              <button
                type="button"
                onClick={() => form.applySuggestion(currentUrl)}
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
              {currentUrl
                ? 'This URL already exists in another bookmark.'
                : 'This URL is already in your bookmarks.'}
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
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCreateTag();
                }
              }}
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
