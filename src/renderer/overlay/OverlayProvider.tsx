import { useOverlayStore } from './overlayStore';

/**
 * Mount once in App.tsx. Renders all active overlays from the overlay store.
 * Each overlay receives isOpen + close so it can animate out before unmounting.
 */
export function OverlayProvider() {
  const overlays = useOverlayStore((s) => s.overlays);
  const close = useOverlayStore((s) => s.close);

  return (
    <>
      {overlays.map(({ id, element, isOpen }) => (
        <div key={id}>
          {element({ isOpen, close: () => close(id) })}
        </div>
      ))}
    </>
  );
}
