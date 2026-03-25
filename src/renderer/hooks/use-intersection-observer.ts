import { useEffect, useRef } from 'react';

interface UseIntersectionObserverOptions {
  enabled?: boolean;
  threshold?: number;
}

/**
 * Returns a ref to attach to a sentinel element.
 * Calls `onIntersect` whenever the sentinel enters the viewport (and `enabled` is true).
 */
export function useIntersectionObserver<T extends HTMLElement>(
  onIntersect: () => void,
  { enabled = true, threshold = 0.1 }: UseIntersectionObserverOptions = {},
): React.RefObject<T | null> {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) onIntersect();
      },
      { threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled, onIntersect, threshold]);

  return ref;
}
