import { useTagsQuery } from '@renderer/hooks/queries/use-tags-query';
import { useUIStore } from '@renderer/store/use-ui-store';
import { cn } from '@renderer/lib/cn';
import { TagBadge } from './tag-badge';

export function TagFilter() {
  const { data } = useTagsQuery();
  const tags = data?.tags ?? [];
  const total = data?.total ?? 0;
  const { selectedTagIds, toggleTag, clearTags } = useUIStore();

  const allActive = selectedTagIds.length === 0;

  return (
    <div className="flex flex-col px-3 py-2">
      {/* All bookmarks row */}
      <button
        onClick={clearTags}
        className={cn(
          'w-full flex items-center gap-1.5',
          'text-xs px-2 py-1.5 rounded-sm text-left',
          'transition-colors duration-75 cursor-pointer',
          'border-l-2',
          allActive
            ? 'border-blue-500 bg-gray-800 text-white'
            : 'border-transparent text-gray-400 hover:bg-gray-800/50 hover:text-gray-200',
        )}
      >
        <span className="flex-1">All bookmarks</span>
        <span
          className={cn('text-[10px] tabular-nums', allActive ? 'text-gray-400' : 'text-gray-600')}
        >
          {total}
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
                count={tag.count}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
