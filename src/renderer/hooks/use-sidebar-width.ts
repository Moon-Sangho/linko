import { useCallback, useState } from 'react';

export const STORAGE_KEY = 'linko:sidebar-width';
export const MIN_SIDEBAR_WIDTH = 180;
export const MAX_SIDEBAR_WIDTH = 360;
export const DEFAULT_SIDEBAR_WIDTH = 224;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function readPersistedWidth(): number {
  const saved = localStorage.getItem(STORAGE_KEY);
  const parsed = saved ? parseInt(saved, 10) : NaN;
  return isNaN(parsed) ? DEFAULT_SIDEBAR_WIDTH : clamp(parsed, MIN_SIDEBAR_WIDTH, MAX_SIDEBAR_WIDTH);
}

export function useSidebarWidth() {
  const [sidebarWidth, setSidebarWidth] = useState<number>(readPersistedWidth);

  const updateWidth = useCallback((w: number) => {
    setSidebarWidth(clamp(w, MIN_SIDEBAR_WIDTH, MAX_SIDEBAR_WIDTH));
  }, []);

  const persistWidth = useCallback((w: number) => {
    const clamped = clamp(w, MIN_SIDEBAR_WIDTH, MAX_SIDEBAR_WIDTH);
    localStorage.setItem(STORAGE_KEY, String(clamped));
    setSidebarWidth(clamped);
  }, []);

  return { sidebarWidth, updateWidth, persistWidth };
}
