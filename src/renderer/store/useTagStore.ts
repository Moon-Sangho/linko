import { create } from 'zustand';
import { IpcChannels } from '../../shared/ipc-channels';
import type { CreateTagInput, IpcResult, Tag } from '../../shared/types';

interface TagStore {
  tags: Tag[];
  isLoading: boolean;
  fetchAll: () => Promise<void>;
  create: (input: CreateTagInput) => Promise<Tag | null>;
  delete: (id: number) => Promise<boolean>;
}

export const useTagStore = create<TagStore>((set) => ({
  tags: [],
  isLoading: false,

  fetchAll: async () => {
    set({ isLoading: true });
    try {
      const result = await window.electron.invoke(IpcChannels.TAGS_GET_ALL) as IpcResult<Tag[]>;
      if (result.success && result.data) {
        set({ tags: result.data });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  create: async (input: CreateTagInput) => {
    const result = await window.electron.invoke(IpcChannels.TAG_CREATE, input) as IpcResult<Tag>;
    if (result.success && result.data) {
      set(state => ({ tags: [...state.tags, result.data!] }));
      return result.data;
    }
    return null;
  },

  delete: async (id: number) => {
    const result = await window.electron.invoke(IpcChannels.TAG_DELETE, id) as IpcResult;
    if (result.success) {
      set(state => ({ tags: state.tags.filter(t => t.id !== id) }));
      return true;
    }
    return false;
  },
}));
