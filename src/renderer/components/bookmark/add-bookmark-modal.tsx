import { useEffect, useRef } from 'react';
import { useCreateBookmarkMutation } from '@renderer/hooks/mutations/use-create-bookmark-mutation';
import { useBookmarkForm } from '@renderer/hooks/use-bookmark-form';
import { IpcChannels } from '@shared/ipc-channels';
import type { IpcResult, UrlMetadata } from '@shared/types';
import { BookmarkFormModal } from './bookmark-form-modal';

interface AddBookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddBookmarkModal({ isOpen, onClose }: AddBookmarkModalProps) {
  const { mutateAsync: createBookmark } = useCreateBookmarkMutation();
  const form = useBookmarkForm();
  const urlRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      form.reset();
      requestAnimationFrame(() => urlRef.current?.focus());
    }
    // form is intentionally excluded: reset/focus should only run on open, not on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

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
      await createBookmark({
        url: data.url,
        title,
        notes: data.notes || null,
        favicon_url: faviconUrl,
        tagIds: form.selectedTagIds,
      });
      onClose();
    } catch {
      form.setError('root', {
        message: 'Failed to save bookmark. Please try again.',
      });
    }
  });

  return (
    <BookmarkFormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Bookmark"
      form={form}
      onSave={handleSave}
      urlInputRef={urlRef}
    />
  );
}
