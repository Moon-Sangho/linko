import { useCallback, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { IpcChannels } from '@shared/ipc-channels';
import type { IpcResult, UrlMetadata } from '@shared/types/domains';
import { isValidUrl } from '@shared/utils/is-valid-url';

const bookmarkSchema = z.object({
  url: z
    .string()
    .min(1, 'URL is required')
    .refine(isValidUrl, 'Please enter a valid URL (https:// or http://)'),
  title: z.string(),
  notes: z.string(),
});

export type BookmarkFormValues = z.infer<typeof bookmarkSchema>;

/**
 * Shared form state + URL-field logic for Add and Edit bookmark modals.
 * Uses react-hook-form + Zod for validation and form state management.
 * Uses a session counter to discard stale async IPC results when the modal
 * is closed/reopened before in-flight calls resolve (race condition fix).
 */
export function useBookmarkForm() {
  const sessionRef = useRef(0);
  /** True when title was set by auto-fetch (not manually typed). Re-fetch on URL change. */
  const titleAutoFilledRef = useRef(false);

  const rhf = useForm<BookmarkFormValues>({
    resolver: zodResolver(bookmarkSchema),
    defaultValues: { url: '', title: '', notes: '' },
    mode: 'onSubmit',
  });

  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [isFetchingMeta, setIsFetchingMeta] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [suggestedUrl, setSuggestedUrl] = useState('');

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

    const currentTitle = rhf.getValues('title');
    if (!currentTitle || titleAutoFilledRef.current) {
      if (session !== sessionRef.current) return;
      setIsFetchingMeta(true);
      try {
        const metaResult = (await window.electron.invoke(
          IpcChannels.BOOKMARK_FETCH_METADATA,
          validUrl,
        )) as IpcResult<UrlMetadata>;
        if (session !== sessionRef.current) return;
        if (metaResult.success && metaResult.data?.title) {
          rhf.setValue('title', metaResult.data.title);
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
    const trimmed = rhf.getValues('url').trim();

    // Bare domain — no protocol at all
    if (trimmed && !/^https?:\/\//i.test(trimmed)) {
      const isIp = /^(\d{1,3}\.){3}\d{1,3}(:\d+)?$/.test(trimmed);
      const suggested = `${isIp ? 'http' : 'https'}://${trimmed}`;
      if (isValidUrl(suggested)) {
        rhf.setError('url', { message: 'URL must start with https:// or http://' });
        setSuggestedUrl(suggested);
      } else {
        rhf.setError('url', { message: 'Please enter a valid URL (https:// or http://)' });
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
    rhf.setValue('url', accepted);
    rhf.clearErrors('url');
    setSuggestedUrl('');
    setIsDuplicate(false);
    await runBlurChecks(accepted, skipDupCheckForUrl);
  }

  function handleUrlChange(value: string) {
    rhf.setValue('url', value);
    rhf.clearErrors('url');
    setSuggestedUrl('');
    setIsDuplicate(false);
  }

  /** Marks title as manually typed, so URL changes won't auto-overwrite it. */
  function handleTitleChange(value: string) {
    titleAutoFilledRef.current = false;
    rhf.setValue('title', value);
  }

  function toggleTag(tagId: string) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId],
    );
  }

  /** Resets all fields and cancels in-flight async calls. */
  function reset() {
    sessionRef.current += 1;
    titleAutoFilledRef.current = false;
    rhf.reset({ url: '', title: '', notes: '' });
    setSelectedTagIds([]);
    setIsFetchingMeta(false);
    setIsDuplicate(false);
    setSuggestedUrl('');
  }

  /** Pre-fills form for edit mode and cancels in-flight async calls. */
  const prefill = useCallback(
    (data: { url: string; title: string; notes: string; tagIds: string[] }) => {
      sessionRef.current += 1;
      titleAutoFilledRef.current = false;
      rhf.reset({ url: data.url, title: data.title, notes: data.notes });
      setSelectedTagIds(data.tagIds);
      setIsFetchingMeta(false);
      setIsDuplicate(false);
      setSuggestedUrl('');
    },
    // rhf.reset is stable (react-hook-form guarantee); setters are stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  /** Cancels any in-flight async operations (blur-triggered fetch). */
  function cancel() {
    sessionRef.current += 1;
    setIsFetchingMeta(false);
  }

  const watchedUrl = rhf.watch('url');
  const watchedTitle = rhf.watch('title');
  const canSave = watchedUrl.length > 0 && isValidUrl(watchedUrl) && !rhf.formState.isSubmitting;

  return {
    // RHF-proxied (selective)
    handleSubmit: rhf.handleSubmit,
    formState: rhf.formState,
    register: rhf.register,
    setError: rhf.setError,
    // Controlled field values
    url: watchedUrl,
    title: watchedTitle,
    // Form-specific state (not in RHF)
    selectedTagIds,
    isFetchingMeta,
    isDuplicate,
    isSaving: rhf.formState.isSubmitting,
    suggestedUrl,
    canSave,
    // Handlers
    handleUrlChange,
    handleUrlBlur,
    handleTitleChange,
    applySuggestion,
    toggleTag,
    isValidUrl,
    // Lifecycle
    reset,
    prefill,
    cancel,
  };
}

export type BookmarkFormHandle = ReturnType<typeof useBookmarkForm>;
