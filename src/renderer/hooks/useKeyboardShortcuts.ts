import { useEffect } from 'react';
import { useUIStore } from '../store/useUIStore';

// Computed once at module load — stable in Electron where process.platform is fixed
const isMac = navigator.userAgent.toUpperCase().includes('MAC');

export function useKeyboardShortcuts() {
  const {
    isAddModalOpen,
    isEditModalOpen,
    isCommandPaletteOpen,
    openAddModal,
    closeAddModal,
    closeEditModal,
    openCommandPalette,
    closeCommandPalette,
  } = useUIStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      if (modifier && e.key === 'k') {
        e.preventDefault();
        isCommandPaletteOpen ? closeCommandPalette() : openCommandPalette();
        return;
      }

      if (modifier && e.key === 'n') {
        e.preventDefault();
        openAddModal();
        return;
      }

      if (e.key === 'Escape') {
        if (isCommandPaletteOpen) {
          closeCommandPalette();
        } else if (isEditModalOpen) {
          closeEditModal();
        } else if (isAddModalOpen) {
          closeAddModal();
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [
    isAddModalOpen,
    isEditModalOpen,
    isCommandPaletteOpen,
    openAddModal,
    closeAddModal,
    closeEditModal,
    openCommandPalette,
    closeCommandPalette,
  ]);
}
