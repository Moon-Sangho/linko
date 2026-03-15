import type { Tag } from '@shared/types';

interface TagBadgeProps {
  tag: Tag;
  isActive: boolean;
  onClick: () => void;
}

export function TagBadge({ tag, isActive, onClick }: TagBadgeProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left text-xs rounded px-2 py-0.5 transition-colors duration-75 cursor-pointer
        ${isActive
          ? 'bg-blue-500 text-white'
          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
        }
      `}
    >
      {tag.name}
    </button>
  );
}
