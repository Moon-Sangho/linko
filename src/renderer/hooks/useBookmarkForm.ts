import { useRef, useState } from 'react';
import { IpcChannels } from '../../shared/ipc-channels';
import { IpcResult, UrlMetadata } from '../../shared/types';

/**
 * Shared form state + URL-field logic for Add and Edit bookmark modals.
 * Uses a session counter to discard stale async IPC results when the modal
 * is closed/reopened before in-flight calls resolve (race condition fix).
 */
export function useBookmarkForm() {
  const sessionRef = useRef(0);

  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [isFetchingMeta, setIsFetchingMeta] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [urlError, setUrlError] = useState('');
  const [saveError, setSaveError] = useState('');

  /** Only accepts http: and https: to prevent javascript:, file:, etc. */
  function isValidUrl(value: string): boolean {
    try {
      const u = new URL(value);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /**
   * Call on URL input blur. Pass the bookmark's original URL for the edit
   * modal so the duplicate check is skipped when the URL hasn't changed.
   */
  async function handleUrlBlur(skipDupCheckForUrl?: string) {
    if (!url || !isValidUrl(url)) return;
    if (skipDupCheckForUrl && url === skipDupCheckForUrl) return;

    // Capture this session; if it's stale by the time the call returns, discard.
    const session = ++sessionRef.current;

    const dupResult = (await window.electron.invoke(
      IpcChannels.BOOKMARK_CHECK_DUPLICATE,
      url,
    )) as IpcResult<boolean>;
    if (session !== sessionRef.current) return;
    setIsDuplicate(dupResult.success && dupResult.data === true);

    if (!title) {
      if (session !== sessionRef.current) return;
      setIsFetchingMeta(true);
      try {
        const metaResult = (await window.electron.invoke(
          IpcChannels.BOOKMARK_FETCH_METADATA,
          url,
        )) as IpcResult<UrlMetadata>;
        if (session !== sessionRef.current) return;
        if (metaResult.success && metaResult.data?.title) {
          setTitle(metaResult.data.title);
        }
      } finally {
        if (session === sessionRef.current) {
          setIsFetchingMeta(false);
        }
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

  /** Resets all fields and cancels in-flight async calls. */
  function reset() {
    sessionRef.current += 1;
    setUrl('');
    setTitle('');
    setNotes('');
    setSelectedTagIds([]);
    setIsFetchingMeta(false);
    setIsDuplicate(false);
    setIsSaving(false);
    setUrlError('');
    setSaveError('');
  }

  /** Pre-fills form for edit mode and cancels in-flight async calls. */
  function prefill(data: { url: string; title: string; notes: string; tagIds: number[] }) {
    sessionRef.current += 1;
    setUrl(data.url);
    setTitle(data.title);
    setNotes(data.notes);
    setSelectedTagIds(data.tagIds);
    setIsFetchingMeta(false);
    setIsDuplicate(false);
    setIsSaving(false);
    setUrlError('');
    setSaveError('');
  }

  const canSave = url.length > 0 && isValidUrl(url) && !isSaving && !isFetchingMeta;

  return {
    // Field values
    url,
    title,
    notes,
    selectedTagIds,
    // Async/validation state
    isFetchingMeta,
    isDuplicate,
    isSaving,
    setIsSaving,
    urlError,
    setUrlError,
    saveError,
    setSaveError,
    canSave,
    // Setters
    setTitle,
    setNotes,
    // Handlers
    handleUrlBlur,
    handleUrlChange,
    toggleTag,
    isValidUrl,
    // Lifecycle
    reset,
    prefill,
  };
}
