import { create } from 'zustand';
import { IpcChannels } from '@shared/ipc-channels';
import type {
  Bookmark,
  CreateBookmarkInput,
  UpdateBookmarkInput,
  SearchBookmarksInput,
  IpcResult,
} from '@shared/types';

interface BookmarkStore {
  bookmarks: Bookmark[];
  isLoading: boolean;
  error: string | null;
  selectedBookmark: Bookmark | null;
  fetchAll: () => Promise<void>;
  search: (input: SearchBookmarksInput) => Promise<void>;
  create: (input: CreateBookmarkInput) => Promise<Bookmark | null>;
  update: (id: number, input: UpdateBookmarkInput) => Promise<Bookmark | null>;
  remove: (id: number) => Promise<boolean>;
  open: (url: string) => Promise<void>;
  selectBookmark: (bookmark: Bookmark | null) => void;
}

export const useBookmarkStore = create<BookmarkStore>((set) => ({
  bookmarks: [],
  isLoading: false,
  error: null,
  selectedBookmark: null,

  fetchAll: async () => {
    set({ isLoading: true, error: null });
    const result = (await window.electron.invoke(
      IpcChannels.BOOKMARKS_GET_ALL,
    )) as IpcResult<Bookmark[]>;
    if (result.success) {
      set({ bookmarks: result.data ?? [], isLoading: false });
    } else {
      set({ error: result.error ?? 'Failed to fetch bookmarks', isLoading: false });
    }
  },

  search: async (input: SearchBookmarksInput) => {
    set({ isLoading: true, error: null });
    const result = (await window.electron.invoke(
      IpcChannels.BOOKMARKS_SEARCH,
      input,
    )) as IpcResult<Bookmark[]>;
    if (result.success) {
      set({ bookmarks: result.data ?? [], isLoading: false });
    } else {
      set({ error: result.error ?? 'Search failed', isLoading: false });
    }
  },

  create: async (input: CreateBookmarkInput) => {
    const result = (await window.electron.invoke(
      IpcChannels.BOOKMARK_CREATE,
      input,
    )) as IpcResult<Bookmark>;
    if (!result.success) {
      set({ error: result.error ?? 'Failed to create bookmark' });
      return null;
    }
    return result.data!;
  },

  update: async (id: number, input: UpdateBookmarkInput) => {
    const result = (await window.electron.invoke(
      IpcChannels.BOOKMARK_UPDATE,
      id,
      input,
    )) as IpcResult<Bookmark>;
    if (!result.success) {
      set({ error: result.error ?? 'Failed to update bookmark' });
      return null;
    }
    return result.data!;
  },

  remove: async (id: number) => {
    const result = (await window.electron.invoke(
      IpcChannels.BOOKMARK_DELETE,
      id,
    )) as IpcResult;
    if (!result.success) {
      set({ error: result.error ?? 'Failed to delete bookmark' });
      return false;
    }
    return true;
  },

  open: async (url: string) => {
    await window.electron.invoke(IpcChannels.BOOKMARK_OPEN, url);
  },

  selectBookmark: (bookmark) => set({ selectedBookmark: bookmark }),
}));
