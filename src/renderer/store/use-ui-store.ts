import { create } from 'zustand';

interface UIStore {
  searchQuery: string;
  selectedTagIds: number[];

  setSearchQuery: (query: string) => void;
  toggleTag: (id: number) => void;
  clearTags: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  searchQuery: '',
  selectedTagIds: [],

  setSearchQuery: (query) => set({ searchQuery: query }),
  toggleTag: (id) =>
    set((state) => ({
      selectedTagIds: state.selectedTagIds[0] === id ? [] : [id],
    })),
  clearTags: () => set({ selectedTagIds: [] }),
}));
