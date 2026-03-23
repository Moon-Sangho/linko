import { useEffect, useState } from 'react';
import { IpcChannels } from '@shared/ipc-channels';
import type { IpcResult } from '@shared/types';

interface TitleBarProps {
  title?: string;
}

export function TitleBar({ title = 'Linko' }: TitleBarProps) {
  const handleMinimize = () => window.electron.invoke(IpcChannels.WINDOW_MINIMIZE);
  const handleMaximize = () => window.electron.invoke(IpcChannels.WINDOW_MAXIMIZE);
  const handleClose = () => window.electron.invoke(IpcChannels.WINDOW_CLOSE);
  const [version, setVersion] = useState<string | null>(null);

  useEffect(() => {
    window.electron
      .invoke(IpcChannels.APP_GET_VERSION)
      .then((r) => {
        const result = r as IpcResult<string>;
        if (result.success && result.data) setVersion(result.data);
      })
      .catch(() => {});
  }, []);

  const isMac = navigator.platform.toLowerCase().includes('mac');

  return (
    <div
      className="flex items-center h-10 bg-gray-950 border-b border-gray-800 select-none flex-shrink-0"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* macOS traffic lights — system handles these with hiddenInset */}
      {isMac && <div className="w-20 flex-shrink-0" />}

      {/* App title — centered */}
      <div className="flex-1 text-center flex items-center justify-center gap-1.5">
        <span className="text-sm font-semibold text-gray-300">{title}</span>
        {version && <span className="text-xs text-gray-600">v{version}</span>}
      </div>

      {/* Windows controls */}
      {!isMac && (
        <div
          className="flex items-center flex-shrink-0"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <button
            onClick={handleMinimize}
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-colors"
            aria-label="Minimize"
          >
            <svg width="10" height="1" viewBox="0 0 10 1" fill="currentColor">
              <rect width="10" height="1" />
            </svg>
          </button>
          <button
            onClick={handleMaximize}
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-colors"
            aria-label="Maximize"
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            >
              <rect x="0.5" y="0.5" width="9" height="9" />
            </svg>
          </button>
          <button
            onClick={handleClose}
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:bg-red-600 hover:text-white transition-colors"
            aria-label="Close"
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
            >
              <line x1="0" y1="0" x2="10" y2="10" />
              <line x1="10" y1="0" x2="0" y2="10" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
