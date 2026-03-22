import { useMemo } from 'react';
import { useBookmarksQuery } from '@renderer/hooks/queries/useBookmarksQuery';
import { useTagsQuery } from '@renderer/hooks/queries/useTagsQuery';
import { useUIStore } from '@renderer/store/useUIStore';
import { TagBadge } from './TagBadge';

export function TagFilter() {
  const { data: tags = [] } = useTagsQuery();
  const { selectedTagIds, toggleTag, clearTags } = useUIStore();
  const { data: bookmarks = [] } = useBookmarksQuery();

  const allActive = selectedTagIds.length === 0;

  const tagCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    for (const bookmark of bookmarks) {
      for (const tag of bookmark.tags) {
        counts[tag.id] = (counts[tag.id] ?? 0) + 1;
      }
    }
    return counts;
  }, [bookmarks]);

  return (
    <div className="flex flex-col px-3 py-2">
      {/* All bookmarks row */}
      <button
        onClick={clearTags}
        className={`
          w-full flex items-center gap-1.5
          text-xs px-2 py-1.5 rounded-sm text-left
          transition-colors duration-75 cursor-pointer
          border-l-2
          ${allActive
            ? 'border-blue-500 bg-gray-800 text-white'
            : 'border-transparent text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
          }
        `}
      >
        <span className="flex-1">All bookmarks</span>
        <span className={`text-[10px] tabular-nums ${allActive ? 'text-gray-400' : 'text-gray-600'}`}>
          {bookmarks.length}
        </span>
      </button>

      {tags.length > 0 && (
        <>
          <div className="border-t border-gray-800 my-2" />
          <p className="text-[11px] text-gray-500 px-2 mb-1">Tags</p>
          <div className="flex flex-col">
            {tags.map((tag) => (
              <TagBadge
                key={tag.id}
                tag={tag}
                isActive={selectedTagIds.includes(tag.id)}
                onClick={() => toggleTag(tag.id)}
                count={tagCounts[tag.id] ?? 0}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
