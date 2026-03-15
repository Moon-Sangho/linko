import { create } from 'zustand';
import type { Bookmark } from '@shared/types';

interface UIStore {
  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Tag filtering
  selectedTagIds: number[];
  toggleTag: (tagId: number) => void;
  clearTags: () => void;

  // Modals
  isAddModalOpen: boolean;
  openAddModal: () => void;
  closeAddModal: () => void;

  isEditModalOpen: boolean;
  editingBookmark: Bookmark | null;
  openEditModal: (bookmark: Bookmark) => void;
  closeEditModal: () => void;

  // Command palette
  isCommandPaletteOpen: boolean;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  // Search
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Tag filtering
  selectedTagIds: [],
  toggleTag: (tagId) =>
    set((state) => ({
      selectedTagIds: state.selectedTagIds.includes(tagId)
        ? state.selectedTagIds.filter((id) => id !== tagId)
        : [...state.selectedTagIds, tagId],
    })),
  clearTags: () => set({ selectedTagIds: [] }),

  // Modals
  isAddModalOpen: false,
  openAddModal: () => set({ isAddModalOpen: true }),
  closeAddModal: () => set({ isAddModalOpen: false }),

  isEditModalOpen: false,
  editingBookmark: null,
  openEditModal: (bookmark) => set({ isEditModalOpen: true, editingBookmark: bookmark }),
  closeEditModal: () => set({ isEditModalOpen: false, editingBookmark: null }),

  // Command palette
  isCommandPaletteOpen: false,
  openCommandPalette: () => set({ isCommandPaletteOpen: true }),
  closeCommandPalette: () => set({ isCommandPaletteOpen: false }),
}));
