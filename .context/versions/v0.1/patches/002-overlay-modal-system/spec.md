# Patch 002 — Overlay-Kit Style Modal Management System

**Date:** 2026-03-17
**Agents involved:** Dev UI

## Problem

Modal state was stored in `useUIStore` (`isAddModalOpen`, `isEditModalOpen`, etc.).
This caused two problems:
1. Every new modal required adding state to the store and wiring it in `App.tsx`
2. Props-drilling to pass open/close handlers through the component tree

## Approach

Adopt an **imperative overlay API** inspired by overlay-kit:
- `overlay.open(<Component />)` — opens modal from anywhere, no store changes needed
- `overlay.close()` / `overlay.closeAll()` — closes programmatically
- Modals accept `{ isOpen, onClose }` props (compatible with animation)

## Changes

- **`src/renderer/overlay/overlayStore.ts`**: Zustand store managing overlay stack
  with animation delay support
- **`src/renderer/overlay/control.ts`**: Imperative `overlay` object (`open`, `close`, `closeAll`)
- **`src/renderer/overlay/OverlayProvider.tsx`**: Single provider mounted once in `App.tsx`;
  renders active overlay stack
- **`useUIStore`**: Remove all modal-specific state (`isAddModalOpen`, `isEditModalOpen`,
  `selectedBookmarkId`, etc.)
- **All modal components**: Changed from reading store state to accepting `{ isOpen, onClose }` props
- **All trigger sites**: Changed from `useUIStore` setters to `overlay.open()` calls
- **`electron.vite.config.ts`**: Add `@renderer` alias for Vite module resolution
- **`useKeyboardShortcuts`**: Renamed `.ts` → `.tsx` to allow JSX; `Cmd+K` toggles
  CommandPalette via `overlay.open()`

## Benefits
- Adding a new modal requires zero changes to `App.tsx` or any store
- Supports modal stacking naturally
- Trigger from any component without props drilling
