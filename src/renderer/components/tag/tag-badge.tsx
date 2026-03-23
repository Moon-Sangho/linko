import type { Tag } from '@shared/types';
import { cn } from '@renderer/lib/cn';

interface TagBadgeProps {
  tag: Tag;
  isActive: boolean;
  onClick: () => void;
  count?: number;
}

export function TagBadge({ tag, isActive, onClick, count }: TagBadgeProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-1.5',
        'text-xs px-2 py-1.5 rounded-sm text-left',
        'transition-colors duration-75 cursor-pointer',
        'border-l-2',
        isActive
          ? 'border-blue-500 bg-gray-800 text-white'
          : 'border-transparent text-gray-400 hover:bg-gray-800/50 hover:text-gray-200',
      )}
    >
      <span className={cn('select-none', isActive ? 'text-blue-400' : 'text-gray-600')}>#</span>
      <span className="flex-1 truncate">{tag.name}</span>
      {count !== undefined && (
        <span
          className={cn('text-[10px] tabular-nums', isActive ? 'text-gray-400' : 'text-gray-600')}
        >
          {count}
        </span>
      )}
    </button>
  );
}
