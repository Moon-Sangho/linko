import { create } from 'zustand';
import { IpcChannels } from '../../shared/ipc-channels';
import type { Bookmark, CreateBookmarkInput, IpcResult, UpdateBookmarkInput } from '../../shared/types';

interface BookmarkStore {
  bookmarks: Bookmark[];
  isLoading: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
  create: (input: CreateBookmarkInput) => Promise<Bookmark | null>;
  update: (id: number, input: UpdateBookmarkInput) => Promise<Bookmark | null>;
  delete: (id: number) => Promise<boolean>;
  openUrl: (id: number) => Promise<void>;
}

export const useBookmarkStore = create<BookmarkStore>((set) => ({
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
    const result = await window.electron.invoke(IpcChannels.BOOKMARK_CREATE, input) as IpcResult<Bookmark>;
    if (result.success && result.data) {
      set(state => ({ bookmarks: [result.data!, ...state.bookmarks] }));
      return result.data;
    }
    return null;
  },

  update: async (id: number, input: UpdateBookmarkInput) => {
    const result = await window.electron.invoke(IpcChannels.BOOKMARK_UPDATE, id, input) as IpcResult<Bookmark>;
    if (result.success && result.data) {
      set(state => ({
        bookmarks: state.bookmarks.map(b => b.id === id ? result.data! : b),
      }));
      return result.data;
    }
    return null;
  },

  delete: async (id: number) => {
    const result = await window.electron.invoke(IpcChannels.BOOKMARK_DELETE, id) as IpcResult;
    if (result.success) {
      set(state => ({ bookmarks: state.bookmarks.filter(b => b.id !== id) }));
      return true;
    }
    return false;
  },

  openUrl: async (id: number) => {
    await window.electron.invoke(IpcChannels.BOOKMARK_OPEN, id);
  },
}));
