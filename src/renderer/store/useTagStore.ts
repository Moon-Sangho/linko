import { create } from 'zustand';
import { IpcChannels } from '@shared/ipc-channels';
import type { Tag, CreateTagInput, IpcResult } from '@shared/types';

interface TagStore {
  tags: Tag[];
  isLoading: boolean;
  fetchAll: () => Promise<void>;
  create: (input: CreateTagInput) => Promise<Tag | null>;
  remove: (id: number) => Promise<boolean>;
}

export const useTagStore = create<TagStore>((set) => ({
  tags: [],
  isLoading: false,

  fetchAll: async () => {
    set({ isLoading: true });
    const result = (await window.electron.invoke(
      IpcChannels.TAGS_GET_ALL,
    )) as IpcResult<Tag[]>;
    if (result.success) {
      set({ tags: result.data ?? [], isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },

  create: async (input: CreateTagInput) => {
    const result = (await window.electron.invoke(
      IpcChannels.TAG_CREATE,
      input,
    )) as IpcResult<Tag>;
    if (!result.success) return null;
    const tag = result.data!;
    set((state) => ({ tags: [...state.tags, tag].sort((a, b) => a.name.localeCompare(b.name)) }));
    return tag;
  },

  remove: async (id: number) => {
    const result = (await window.electron.invoke(
      IpcChannels.TAG_DELETE,
      id,
    )) as IpcResult;
    if (!result.success) return false;
    set((state) => ({ tags: state.tags.filter((t) => t.id !== id) }));
    return true;
  },
}));
