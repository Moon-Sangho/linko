import { create } from 'zustand';

interface UIStore {
  selectedBookmarkId: number | null;
  searchQuery: string;
  selectedTagIds: number[];
  selectedBookmarkIds: number[];

  setSelectedBookmark: (id: number | null) => void;
  setSearchQuery: (query: string) => void;
  toggleTag: (id: number) => void;
  clearTags: () => void;
  toggleBookmarkSelection: (id: number) => void;
  selectAllBookmarks: (ids: number[]) => void;
  clearSelection: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  selectedBookmarkId: null,
  searchQuery: '',
  selectedTagIds: [],
  selectedBookmarkIds: [],

  setSelectedBookmark: (id) => set({ selectedBookmarkId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  toggleTag: (id) =>
    set((state) => ({
      selectedTagIds: state.selectedTagIds[0] === id ? [] : [id],
    })),
  clearTags: () => set({ selectedTagIds: [] }),
  toggleBookmarkSelection: (id) =>
    set((state) => ({
      selectedBookmarkIds: state.selectedBookmarkIds.includes(id)
        ? state.selectedBookmarkIds.filter((x) => x !== id)
        : [...state.selectedBookmarkIds, id],
    })),
  selectAllBookmarks: (ids) => set({ selectedBookmarkIds: ids }),
  clearSelection: () => set({ selectedBookmarkIds: [] }),
}));
