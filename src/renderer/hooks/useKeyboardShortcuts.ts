import { useEffect } from 'react';
import { useUIStore } from '../store/useUIStore';

// Computed once at module load — stable in Electron where process.platform is fixed
const isMac = navigator.userAgent.toUpperCase().includes('MAC');

export function useKeyboardShortcuts() {
  const { isAddModalOpen, isEditModalOpen, openAddModal, closeAddModal, closeEditModal } = useUIStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      if (modifier && e.key === 'n') {
        e.preventDefault();
        openAddModal();
        return;
      }

      if (e.key === 'Escape') {
        if (isEditModalOpen) {
          closeEditModal();
        } else if (isAddModalOpen) {
          closeAddModal();
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isAddModalOpen, isEditModalOpen, openAddModal, closeAddModal, closeEditModal]);
}
