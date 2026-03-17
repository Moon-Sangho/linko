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
  /** True when title was set by auto-fetch (not manually typed). Re-fetch on URL change. */
  const titleAutoFilledRef = useRef(false);

  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [isFetchingMeta, setIsFetchingMeta] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [urlError, setUrlError] = useState('');
  const [suggestedUrl, setSuggestedUrl] = useState('');
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
   * Runs duplicate check and metadata fetch for a fully-qualified URL.
   * Extracted so both handleUrlBlur and applySuggestion can reuse it.
   */
  async function runBlurChecks(validUrl: string, skipDupCheckForUrl?: string) {
    if (skipDupCheckForUrl && validUrl === skipDupCheckForUrl) return;

    const session = ++sessionRef.current;

    const dupResult = (await window.electron.invoke(
      IpcChannels.BOOKMARK_CHECK_DUPLICATE,
      validUrl,
    )) as IpcResult<boolean>;
    if (session !== sessionRef.current) return;
    setIsDuplicate(dupResult.success && dupResult.data === true);

    if (!title || titleAutoFilledRef.current) {
      if (session !== sessionRef.current) return;
      setIsFetchingMeta(true);
      try {
        const metaResult = (await window.electron.invoke(
          IpcChannels.BOOKMARK_FETCH_METADATA,
          validUrl,
        )) as IpcResult<UrlMetadata>;
        if (session !== sessionRef.current) return;
        if (metaResult.success && metaResult.data?.title) {
          setTitle(metaResult.data.title);
          titleAutoFilledRef.current = true;
        }
      } finally {
        if (session === sessionRef.current) {
          setIsFetchingMeta(false);
        }
      }
    }
  }

  /**
   * Call on URL input blur. If the user typed a bare domain (no protocol),
   * shows an error and a "Did you mean?" suggestion instead of auto-correcting.
   * Pass the bookmark's original URL for the edit modal so the duplicate check
   * is skipped when the URL hasn't changed.
   */
  async function handleUrlBlur(skipDupCheckForUrl?: string) {
    const trimmed = url.trim();

    // Bare domain — no protocol at all
    if (trimmed && !/^https?:\/\//i.test(trimmed)) {
      const isIp = /^(\d{1,3}\.){3}\d{1,3}(:\d+)?$/.test(trimmed);
      const suggested = `${isIp ? 'http' : 'https'}://${trimmed}`;
      if (isValidUrl(suggested)) {
        setUrlError('URL must start with https:// or http://');
        setSuggestedUrl(suggested);
      } else {
        setUrlError('Please enter a valid URL (https:// or http://)');
      }
      return;
    }

    setSuggestedUrl('');
    if (!trimmed || !isValidUrl(trimmed)) return;
    await runBlurChecks(trimmed, skipDupCheckForUrl);
  }

  /**
   * Applies the suggested URL (e.g. "https://naver.com") to the field,
   * then immediately runs duplicate check and metadata fetch.
   */
  async function applySuggestion(skipDupCheckForUrl?: string) {
    if (!suggestedUrl) return;
    const accepted = suggestedUrl;
    setUrl(accepted);
    setSuggestedUrl('');
    setUrlError('');
    await runBlurChecks(accepted, skipDupCheckForUrl);
  }

  function handleUrlChange(value: string) {
    setUrl(value);
    setUrlError('');
    setSuggestedUrl('');
    setIsDuplicate(false);
  }

  /** Marks title as manually typed, so URL changes won't auto-overwrite it. */
  function handleTitleChange(value: string) {
    titleAutoFilledRef.current = false;
    setTitle(value);
  }

  function toggleTag(tagId: number) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId],
    );
  }

  /** Resets all fields and cancels in-flight async calls. */
  function reset() {
    sessionRef.current += 1;
    titleAutoFilledRef.current = false;
    setUrl('');
    setTitle('');
    setNotes('');
    setSelectedTagIds([]);
    setIsFetchingMeta(false);
    setIsDuplicate(false);
    setIsSaving(false);
    setUrlError('');
    setSuggestedUrl('');
    setSaveError('');
  }

  /** Pre-fills form for edit mode and cancels in-flight async calls. */
  function prefill(data: { url: string; title: string; notes: string; tagIds: number[] }) {
    sessionRef.current += 1;
    titleAutoFilledRef.current = false;
    setUrl(data.url);
    setTitle(data.title);
    setNotes(data.notes);
    setSelectedTagIds(data.tagIds);
    setIsFetchingMeta(false);
    setIsDuplicate(false);
    setIsSaving(false);
    setUrlError('');
    setSuggestedUrl('');
    setSaveError('');
  }

  /** Cancels any in-flight async operations (blur-triggered fetch). */
  function cancel() {
    sessionRef.current += 1;
    setIsFetchingMeta(false);
  }

  const canSave = url.length > 0 && isValidUrl(url) && !isSaving;

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
    suggestedUrl,
    applySuggestion,
    saveError,
    setSaveError,
    canSave,
    // Setters
    setTitle,
    setNotes,
    // Handlers
    handleUrlBlur,
    handleUrlChange,
    handleTitleChange,
    toggleTag,
    isValidUrl,
    // Lifecycle
    reset,
    prefill,
    cancel,
  };
}
