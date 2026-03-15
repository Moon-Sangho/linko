import { useEffect } from 'react';
import { useTagStore } from '../../store/useTagStore';
import { useUIStore } from '../../store/useUIStore';
import { TagBadge } from './TagBadge';

export function TagFilter() {
  const { tags, fetchAll } = useTagStore();
  const { selectedTagIds, toggleTag, clearTags } = useUIStore();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const allActive = selectedTagIds.length === 0;

  return (
    <div className="flex flex-col gap-1 px-3 py-2">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Tags</p>

      <button
        onClick={clearTags}
        className={`
          text-xs rounded px-2 py-0.5 text-left transition-colors duration-75 cursor-pointer
          ${allActive
            ? 'bg-blue-500 text-white'
            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }
        `}
      >
        All
      </button>

      <div className="flex flex-col gap-1 mt-1">
        {tags.map((tag) => (
          <TagBadge
            key={tag.id}
            tag={tag}
            isActive={selectedTagIds.includes(tag.id)}
            onClick={() => toggleTag(tag.id)}
          />
        ))}
      </div>
    </div>
  );
}
