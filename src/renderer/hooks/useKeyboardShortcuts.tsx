import { useEffect, useRef } from 'react';
import { overlay } from '@renderer/overlay/control';
import { AddBookmarkModal } from '@renderer/components/bookmark/AddBookmarkModal';
import { CommandPalette } from '@renderer/components/search/CommandPalette';

// Computed once at module load — stable in Electron where process.platform is fixed
const isMac = navigator.userAgent.toUpperCase().includes('MAC');

export function useKeyboardShortcuts() {
  // Track the command palette overlay ID so we can toggle it closed
  const commandPaletteId = useRef<string | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      if (modifier && e.key === 'k') {
        e.preventDefault();
        if (commandPaletteId.current !== null) {
          overlay.close(commandPaletteId.current);
          commandPaletteId.current = null;
        } else {
          commandPaletteId.current = overlay.open(({ isOpen, close }) => {
            const handleClose = () => {
              commandPaletteId.current = null;
              close();
            };
            return <CommandPalette isOpen={isOpen} onClose={handleClose} />;
          });
        }
        return;
      }

      if (modifier && e.key === 'n') {
        e.preventDefault();
        overlay.open(({ isOpen, close }) => (
          <AddBookmarkModal isOpen={isOpen} onClose={close} />
        ));
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}
