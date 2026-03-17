import { create } from 'zustand';

interface UIStore {
  selectedBookmarkId: number | null;
  searchQuery: string;
  selectedTagIds: number[];

  setSelectedBookmark: (id: number | null) => void;
  setSearchQuery: (query: string) => void;
  toggleTag: (id: number) => void;
  clearTags: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  selectedBookmarkId: null,
  searchQuery: '',
  selectedTagIds: [],

  setSelectedBookmark: (id) => set({ selectedBookmarkId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  toggleTag: (id) =>
    set((state) => ({
      selectedTagIds: state.selectedTagIds[0] === id ? [] : [id],
    })),
  clearTags: () => set({ selectedTagIds: [] }),
}));
