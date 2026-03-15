import { useState, useRef, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { IpcChannels } from '../../../shared/ipc-channels';
import { UrlMetadata, IpcResult, Tag } from '../../../shared/types';
import { useBookmarkStore } from '../../store/useBookmarkStore';
import { useUIStore } from '../../store/useUIStore';
import { useTagStore } from '../../store/useTagStore';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Spinner } from '../ui/Spinner';

export function AddBookmarkModal() {
  const { isAddModalOpen, closeAddModal } = useUIStore();
  const { create } = useBookmarkStore();
  const { tags, fetchAll: fetchTags } = useTagStore();

  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [isFetchingMeta, setIsFetchingMeta] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [urlError, setUrlError] = useState('');

  const urlRef = useRef<HTMLInputElement>(null);

  // Focus URL input on open; fetch tags
  useEffect(() => {
    if (isAddModalOpen) {
      resetForm();
      fetchTags();
      setTimeout(() => urlRef.current?.focus(), 50);
    }
  }, [isAddModalOpen]);

  function resetForm() {
    setUrl('');
    setTitle('');
    setNotes('');
    setSelectedTagIds([]);
    setIsFetchingMeta(false);
    setIsDuplicate(false);
    setIsSaving(false);
    setUrlError('');
  }

  function isValidUrl(value: string) {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }

  async function handleUrlBlur() {
    if (!url || !isValidUrl(url)) return;

    // Duplicate check
    const dupResult: IpcResult<boolean> = await window.electron.invoke(
      IpcChannels.BOOKMARK_CHECK_DUPLICATE,
      url,
    );
    setIsDuplicate(dupResult.success && dupResult.data === true);

    // Fetch metadata if title not yet set
    if (!title) {
      setIsFetchingMeta(true);
      try {
        const metaResult: IpcResult<UrlMetadata> = await window.electron.invoke(
          IpcChannels.BOOKMARK_FETCH_METADATA,
          url,
        );
        if (metaResult.success && metaResult.data?.title) {
          setTitle(metaResult.data.title);
        }
      } finally {
        setIsFetchingMeta(false);
      }
    }
  }

  function handleUrlChange(value: string) {
    setUrl(value);
    setUrlError('');
    setIsDuplicate(false);
  }

  function toggleTag(tagId: number) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId],
    );
  }

  async function handleSave() {
    if (!url) {
      setUrlError('URL is required');
      return;
    }
    if (!isValidUrl(url)) {
      setUrlError('Please enter a valid URL');
      return;
    }

    setIsSaving(true);
    try {
      await create({ url, title: title || null, notes: notes || null, tagIds: selectedTagIds });
      closeAddModal();
    } finally {
      setIsSaving(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSave();
    }
  }

  const canSave = url.length > 0 && !isSaving && !isFetchingMeta;

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
            disabled={!canSave}
            className="px-4 py-2 text-sm bg-[var(--color-accent)] text-white rounded-md hover:bg-[var(--color-accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isSaving && <Spinner size="sm" />}
            Save
          </button>
        </div>
      }
    >
      <div className="space-y-4" onKeyDown={handleKeyDown}>
        {/* URL */}
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
            URL <span className="text-[var(--color-danger)]">*</span>
          </label>
          <Input
            ref={urlRef}
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            onBlur={handleUrlBlur}
            error={urlError}
          />
          {isDuplicate && (
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
            placeholder={isFetchingMeta ? 'Fetching title…' : 'Page title'}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isFetchingMeta}
            isLoading={isFetchingMeta}
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
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-md text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] px-3 py-2 resize-none focus:outline-none focus:border-[var(--color-border-focus)] focus:ring-1 focus:ring-[var(--color-accent)]/20 transition-colors"
          />
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
              Tags
            </label>
            <TagCheckboxList tags={tags} selectedIds={selectedTagIds} onToggle={toggleTag} />
          </div>
        )}
      </div>
    </Modal>
  );
}

function TagCheckboxList({
  tags,
  selectedIds,
  onToggle,
}: {
  tags: Tag[];
  selectedIds: number[];
  onToggle: (id: number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        const checked = selectedIds.includes(tag.id);
        return (
          <label
            key={tag.id}
            className={`
              flex items-center gap-1.5 text-xs px-2.5 py-1 rounded cursor-pointer
              border transition-colors duration-[80ms]
              ${checked
                ? 'bg-[var(--color-accent-subtle)] border-[var(--color-accent)] text-[var(--color-accent)]'
                : 'bg-[var(--color-bg-elevated)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-focus)]'
              }
            `}
          >
            <input
              type="checkbox"
              className="sr-only"
              checked={checked}
              onChange={() => onToggle(tag.id)}
            />
            {tag.name}
          </label>
        );
      })}
    </div>
  );
}
