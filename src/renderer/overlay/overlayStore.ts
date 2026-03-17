import { create } from 'zustand';
import type { ReactNode } from 'react';

export type OverlayElement = (props: { isOpen: boolean; close: () => void }) => ReactNode;

interface OverlayItem {
  id: string;
  element: OverlayElement;
  isOpen: boolean;
}

interface OverlayStore {
  overlays: OverlayItem[];
  open: (element: OverlayElement) => string;
  close: (id: string) => void;
  closeAll: () => void;
}

// Delay must cover the Modal exit animation (fade-out + zoom-out ~150ms)
const EXIT_ANIMATION_MS = 200;

export const useOverlayStore = create<OverlayStore>((set) => ({
  overlays: [],

  open: (element) => {
    const id = crypto.randomUUID();
    set((state) => ({
      overlays: [...state.overlays, { id, element, isOpen: true }],
    }));
    return id;
  },

  close: (id) => {
    // Mark closed first so Radix Dialog can play the exit animation
    set((state) => ({
      overlays: state.overlays.map((o) =>
        o.id === id ? { ...o, isOpen: false } : o,
      ),
    }));
    setTimeout(() => {
      set((state) => ({
        overlays: state.overlays.filter((o) => o.id !== id),
      }));
    }, EXIT_ANIMATION_MS);
  },

  closeAll: () => {
    set((state) => ({
      overlays: state.overlays.map((o) => ({ ...o, isOpen: false })),
    }));
    setTimeout(() => {
      set({ overlays: [] });
    }, EXIT_ANIMATION_MS);
  },
}));
