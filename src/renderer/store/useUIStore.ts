import { create } from 'zustand';

interface UIStore {
  selectedBookmarkId: number | null;
  isAddModalOpen: boolean;
  isEditModalOpen: boolean;
  isCommandPaletteOpen: boolean;
  searchQuery: string;
  selectedTagIds: number[];

  setSelectedBookmark: (id: number | null) => void;
  openAddModal: () => void;
  closeAddModal: () => void;
  openEditModal: (id: number) => void;
  closeEditModal: () => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  setSearchQuery: (query: string) => void;
  toggleTag: (id: number) => void;
  clearTags: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  selectedBookmarkId: null,
  isAddModalOpen: false,
  isEditModalOpen: false,
  isCommandPaletteOpen: false,
  searchQuery: '',
  selectedTagIds: [],

  setSelectedBookmark: (id) => set({ selectedBookmarkId: id }),
  openAddModal: () => set({ isAddModalOpen: true }),
  closeAddModal: () => set({ isAddModalOpen: false }),
  openEditModal: (id) => set({ isEditModalOpen: true, selectedBookmarkId: id }),
  closeEditModal: () => set({ isEditModalOpen: false, selectedBookmarkId: null }),
  openCommandPalette: () => set({ isCommandPaletteOpen: true }),
  closeCommandPalette: () => set({ isCommandPaletteOpen: false }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  toggleTag: (id) =>
    set(state => ({
      selectedTagIds: state.selectedTagIds[0] === id ? [] : [id],
    })),
  clearTags: () => set({ selectedTagIds: [] }),
}));
