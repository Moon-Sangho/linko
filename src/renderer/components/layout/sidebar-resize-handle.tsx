import { useCallback, useRef, useState } from 'react';
import { MIN_SIDEBAR_WIDTH, MAX_SIDEBAR_WIDTH } from '@renderer/hooks/use-sidebar-width';
import { cn } from '@renderer/lib/cn';

interface SidebarResizeHandleProps {
  sidebarWidth: number;
  onResize: (newWidth: number) => void;
  onResizeEnd: (finalWidth: number) => void;
}

export function SidebarResizeHandle({ sidebarWidth, onResize, onResizeEnd }: SidebarResizeHandleProps) {
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);

  const clamp = (value: number) =>
    Math.min(Math.max(value, MIN_SIDEBAR_WIDTH), MAX_SIDEBAR_WIDTH);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      startXRef.current = e.clientX;
      startWidthRef.current = sidebarWidth;
      setIsDragging(true);

      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const delta = moveEvent.clientX - startXRef.current;
        onResize(clamp(startWidthRef.current + delta));
      };

      const handleMouseUp = (upEvent: MouseEvent) => {
        const delta = upEvent.clientX - startXRef.current;
        const finalWidth = clamp(startWidthRef.current + delta);
        onResizeEnd(finalWidth);

        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        setIsDragging(false);

        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [sidebarWidth, onResize, onResizeEnd],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const next = clamp(sidebarWidth + 8);
        onResize(next);
        onResizeEnd(next);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const next = clamp(sidebarWidth - 8);
        onResize(next);
        onResizeEnd(next);
      }
    },
    [sidebarWidth, onResize, onResizeEnd],
  );

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-valuenow={sidebarWidth}
      aria-valuemin={MIN_SIDEBAR_WIDTH}
      aria-valuemax={MAX_SIDEBAR_WIDTH}
      tabIndex={0}
      onMouseDown={handleMouseDown}
      onKeyDown={handleKeyDown}
      className="relative z-10 w-1 flex-shrink-0 cursor-col-resize group focus:outline-none"
    >
      {/* Visual indicator line */}
      <div
        className={cn(
          'absolute inset-y-0 left-0 w-px transition-colors duration-75',
          isDragging
            ? 'bg-blue-500/60'
            : 'bg-gray-800 group-hover:bg-gray-600 group-focus:bg-gray-600',
        )}
      />
    </div>
  );
}
