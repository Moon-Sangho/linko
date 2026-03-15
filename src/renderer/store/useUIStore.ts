import { create } from 'zustand';

interface UIStore {
  selectedBookmarkId: number | null;
  isAddModalOpen: boolean;
  isEditModalOpen: boolean;
  searchQuery: string;
  selectedTagIds: number[];

  setSelectedBookmark: (id: number | null) => void;
  openAddModal: () => void;
  closeAddModal: () => void;
  openEditModal: (id: number) => void;
  closeEditModal: () => void;
  setSearchQuery: (query: string) => void;
  toggleTag: (id: number) => void;
  clearTags: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  selectedBookmarkId: null,
  isAddModalOpen: false,
  isEditModalOpen: false,
  searchQuery: '',
  selectedTagIds: [],

  setSelectedBookmark: (id) => set({ selectedBookmarkId: id }),
  openAddModal: () => set({ isAddModalOpen: true }),
  closeAddModal: () => set({ isAddModalOpen: false }),
  openEditModal: (id) => set({ isEditModalOpen: true, selectedBookmarkId: id }),
  closeEditModal: () => set({ isEditModalOpen: false, selectedBookmarkId: null }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  toggleTag: (id) =>
    set(state => ({
      selectedTagIds: state.selectedTagIds.includes(id)
        ? state.selectedTagIds.filter(t => t !== id)
        : [...state.selectedTagIds, id],
    })),
  clearTags: () => set({ selectedTagIds: [] }),
}));
