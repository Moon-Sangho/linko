import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { IpcChannels } from '../../../shared/ipc-channels';
import { UrlMetadata, IpcResult, Tag } from '../../../shared/types';
import { useBookmarkStore } from '../../store/useBookmarkStore';
import { useUIStore } from '../../store/useUIStore';
import { useTagStore } from '../../store/useTagStore';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Spinner } from '../ui/Spinner';

export function EditBookmarkModal() {
  const { isEditModalOpen, selectedBookmarkId, closeEditModal } = useUIStore();
  const { bookmarks, update, deleteBookmark } = useBookmarkStore();
  const { tags, fetchAll: fetchTags } = useTagStore();

  const bookmark = bookmarks.find((b) => b.id === selectedBookmarkId) ?? null;

  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [isFetchingMeta, setIsFetchingMeta] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [urlError, setUrlError] = useState('');

  // Pre-fill form when bookmark changes
  useEffect(() => {
    if (isEditModalOpen && bookmark) {
      setUrl(bookmark.url);
      setTitle(bookmark.title ?? '');
      setNotes(bookmark.notes ?? '');
      setSelectedTagIds(bookmark.tags.map((t) => t.id));
      setIsFetchingMeta(false);
      setIsDuplicate(false);
      setIsSaving(false);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setUrlError('');
      fetchTags();
    }
  }, [isEditModalOpen, bookmark?.id]);

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
    if (url === bookmark?.url) return; // unchanged — skip duplicate check

    const dupResult: IpcResult<boolean> = await window.electron.invoke(
      IpcChannels.BOOKMARK_CHECK_DUPLICATE,
      url,
    );
    setIsDuplicate(dupResult.success && dupResult.data === true);

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
    if (!bookmark) return;

    setIsSaving(true);
    try {
      await update(bookmark.id, {
        url,
        title: title || null,
        notes: notes || null,
        tagIds: selectedTagIds,
      });
      closeEditModal();
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!bookmark) return;
    setIsDeleting(true);
    try {
      await deleteBookmark(bookmark.id);
      closeEditModal();
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSave();
    }
  }

  const canSave = url.length > 0 && !isSaving && !isFetchingMeta && !isDeleting;

  if (!bookmark) return null;

  return (
    <Modal
      isOpen={isEditModalOpen}
      onClose={closeEditModal}
      title="Edit Bookmark"
      width={520}
      footer={
        <div className="flex items-center justify-between">
          {/* Delete */}
          <div>
            {showDeleteConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--color-text-secondary)]">Delete this bookmark?</span>
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
                  className="px-3 py-1 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3 py-1.5 text-sm text-[var(--color-danger)] hover:bg-[var(--color-danger-subtle)] rounded transition-colors"
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
              {isSaving && <Spinner size="sm" />}
              Save
            </button>
          </div>
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
