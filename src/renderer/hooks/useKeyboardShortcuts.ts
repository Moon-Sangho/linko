import { useEffect } from 'react';
import { useUIStore } from '../store/useUIStore';

export function useKeyboardShortcuts() {
  const { openCommandPalette, openAddModal } = useUIStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey;

      // Cmd+K — open command palette
      if (isMeta && e.key === 'k') {
        e.preventDefault();
        openCommandPalette();
        return;
      }

      // Cmd+N — open add modal
      if (isMeta && e.key === 'n') {
        e.preventDefault();
        openAddModal();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openCommandPalette, openAddModal]);
}
