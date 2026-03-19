import { create } from 'zustand';
import { IpcChannels } from '@shared/ipc-channels';
import type { Bookmark, CreateBookmarkInput, IpcResult, UpdateBookmarkInput } from '@shared/types';
import { useTagStore } from './useTagStore';

interface BookmarkStore {
  bookmarks: Bookmark[];
  isLoading: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
  create: (input: CreateBookmarkInput) => Promise<Bookmark | null>;
  update: (id: number, input: UpdateBookmarkInput) => Promise<Bookmark | null>;
  removeBookmark: (id: number) => Promise<void>;
  removeBulk: (ids: number[]) => Promise<void>;
  openUrl: (url: string) => Promise<void>;
}

export const useBookmarkStore = create<BookmarkStore>((set, get) => ({
  bookmarks: [],
  isLoading: false,
  error: null,

  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await window.electron.invoke(IpcChannels.BOOKMARKS_GET_ALL) as IpcResult<Bookmark[]>;
      if (result.success && result.data) {
        set({ bookmarks: result.data });
      } else {
        set({ error: result.error ?? 'Failed to fetch bookmarks' });
      }
    } catch (err) {
      set({ error: String(err) });
    } finally {
      set({ isLoading: false });
    }
  },

  create: async (input: CreateBookmarkInput) => {
    try {
      const result = await window.electron.invoke(IpcChannels.BOOKMARK_CREATE, input) as IpcResult<Bookmark>;
      if (result.success && result.data) {
        const bookmark = result.data;
        set(state => ({ bookmarks: [bookmark, ...state.bookmarks], error: null }));
        return bookmark;
      }
      set({ error: result.error ?? 'Failed to create bookmark' });
    } catch (err) {
      set({ error: String(err) });
    }
    return null;
  },

  update: async (id: number, input: UpdateBookmarkInput) => {
    try {
      const result = await window.electron.invoke(IpcChannels.BOOKMARK_UPDATE, id, input) as IpcResult<Bookmark>;
      if (result.success && result.data) {
        const bookmark = result.data;
        const updated = get().bookmarks.map(b => b.id === id ? bookmark : b);
        set({ bookmarks: updated, error: null });

        // Remove tags no longer used by any bookmark after tag change
        if (input.tagIds !== undefined) {
          const usedTagIds = new Set(updated.flatMap(b => b.tags.map(t => t.id)));
          useTagStore.setState(tagState => ({
            tags: tagState.tags.filter(tag => usedTagIds.has(tag.id)),
          }));
        }
        return bookmark;
      }
      set({ error: result.error ?? 'Failed to update bookmark' });
    } catch (err) {
      set({ error: String(err) });
    }
    return null;
  },

  removeBookmark: async (id: number): Promise<void> => {
    const result = await window.electron.invoke(IpcChannels.BOOKMARK_DELETE, id) as IpcResult;
    if (result.success) {
      const remaining = get().bookmarks.filter(b => b.id !== id);
      set({ bookmarks: remaining, error: null });

      // Remove tags no longer used by any remaining bookmark
      const usedTagIds = new Set(remaining.flatMap(b => b.tags.map(t => t.id)));
      useTagStore.setState(tagState => ({
        tags: tagState.tags.filter(tag => usedTagIds.has(tag.id)),
      }));
    } else {
      throw new Error(result.error ?? 'Failed to delete bookmark');
    }
  },

  removeBulk: async (ids: number[]): Promise<void> => {
    const remaining = get().bookmarks.filter((b) => !ids.includes(b.id));
    set({ bookmarks: remaining, error: null });

    const usedTagIds = new Set(remaining.flatMap((b) => b.tags.map((t) => t.id)));
    useTagStore.setState((tagState) => ({
      tags: tagState.tags.filter((tag) => usedTagIds.has(tag.id)),
    }));

    try {
      await Promise.all(
        ids.map((id) =>
          window.electron.invoke(IpcChannels.BOOKMARK_DELETE, id) as Promise<IpcResult>,
        ),
      );
    } catch {
      await get().fetchAll();
      throw new Error('Failed to delete some bookmarks');
    }
  },

  openUrl: async (url: string): Promise<void> => {
    try {
      await window.electron.invoke(IpcChannels.BOOKMARK_OPEN, url);
    } catch (err) {
      set({ error: String(err) });
    }
  },
}));
