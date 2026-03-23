import { useOverlayStore } from './overlay-store';
import type { OverlayElement } from './overlay-store';

/**
 * Imperative overlay API — open modals/dialogs from anywhere without
 * registering them in App.tsx or adding local state to components.
 *
 * Usage:
 *   const id = overlay.open(({ isOpen, close }) => (
 *     <MyModal isOpen={isOpen} onClose={close} />
 *   ));
 *
 *   overlay.close(id);   // close a specific overlay
 *   overlay.closeAll();  // close everything
 */
export const overlay = {
  open: (element: OverlayElement): string => {
    return useOverlayStore.getState().open(element);
  },
  close: (id: string): void => {
    useOverlayStore.getState().close(id);
  },
  closeAll: (): void => {
    useOverlayStore.getState().closeAll();
  },
};
