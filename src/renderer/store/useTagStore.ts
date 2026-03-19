import { create } from 'zustand';
import { IpcChannels } from '@shared/ipc-channels';
import type { CreateTagInput, IpcResult, Tag } from '@shared/types';

interface TagStore {
  tags: Tag[];
  isLoading: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
  create: (input: CreateTagInput) => Promise<Tag | null>;
  delete: (id: number) => Promise<boolean>;
}

export const useTagStore = create<TagStore>((set) => ({
  tags: [],
  isLoading: false,
  error: null,

  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await window.electron.invoke(IpcChannels.TAGS_GET_ALL) as IpcResult<Tag[]>;
      if (result.success && result.data) {
        set({ tags: result.data });
      } else {
        set({ error: result.error ?? 'Failed to fetch tags' });
      }
    } catch (err) {
      set({ error: String(err) });
    } finally {
      set({ isLoading: false });
    }
  },

  create: async (input: CreateTagInput) => {
    try {
      const result = await window.electron.invoke(IpcChannels.TAG_CREATE, input) as IpcResult<Tag>;
      if (result.success && result.data) {
        const tag = result.data;
        set(state => ({ tags: [...state.tags, tag], error: null }));
        return tag;
      }
      set({ error: result.error ?? 'Failed to create tag' });
    } catch (err) {
      set({ error: String(err) });
    }
    return null;
  },

  delete: async (id: number) => {
    try {
      const result = await window.electron.invoke(IpcChannels.TAG_DELETE, id) as IpcResult;
      if (result.success) {
        set(state => ({ tags: state.tags.filter(t => t.id !== id), error: null }));
        return true;
      }
      set({ error: result.error ?? 'Failed to delete tag' });
    } catch (err) {
      set({ error: String(err) });
    }
    return false;
  },
}));
