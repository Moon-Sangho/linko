import { useEffect, useMemo, useState } from 'react';
import { Command } from 'cmdk';
import { Search, ExternalLink, X } from 'lucide-react';
import { useBookmarkListQuery } from '@renderer/hooks/queries/use-bookmark-list-query';
import { useIntersectionObserver } from '@renderer/hooks/use-intersection-observer';
import { useOpenUrlMutation } from '@renderer/hooks/mutations/use-open-url-mutation';
import { useDebouncedValue } from '@renderer/hooks/use-debounced-value';
import { Favicon } from '@renderer/components/ui/favicon';
import { Spinner } from '@renderer/components/ui/spinner';
import type { Bookmark } from '@shared/types/domains';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [inputValue, setInputValue] = useState('');
  const debouncedQuery = useDebouncedValue(inputValue, 500);

  useEffect(() => {
    if (!isOpen) setInputValue('');
  }, [isOpen]);

  const { data, isFetchingNextPage, hasNextPage, fetchNextPage } = useBookmarkListQuery({
    query: debouncedQuery,
  });

  const bookmarks = useMemo(() => data?.pages.flatMap((page) => page.results) ?? [], [data]);

  const sentinelRef = useIntersectionObserver<HTMLDivElement>(fetchNextPage, {
    enabled: hasNextPage && !isFetchingNextPage,
  });

  const { mutate: openUrlMutation } = useOpenUrlMutation();

  if (!isOpen) return null;

  const handleSelect = (bookmark: Bookmark) => {
    openUrlMutation(bookmark.url);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-2xl mx-4 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onClose();
          e.stopPropagation();
        }}
      >
        <Command shouldFilter={false} className="flex flex-col">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-700">
            <Search size={16} className="text-gray-400 flex-shrink-0" strokeWidth={1.5} />
            <Command.Input
              value={inputValue}
              onValueChange={setInputValue}
              placeholder="Search bookmarks…"
              className="flex-1 bg-transparent text-sm text-gray-200 placeholder-gray-500 focus:outline-none"
              autoFocus
            />
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-300"
              aria-label="Close"
            >
              <X size={14} strokeWidth={1.5} />
            </button>
          </div>
          <Command.List className="max-h-96 overflow-y-auto p-2">
            <Command.Empty className="py-8 text-center text-sm text-gray-500">
              No bookmarks found.
            </Command.Empty>
            <Command.Group heading={<span className="text-xs text-gray-500 px-2">Bookmarks</span>}>
              {bookmarks.map((bookmark) => (
                <Command.Item
                  key={bookmark.id}
                  value={String(bookmark.id)}
                  onSelect={() => handleSelect(bookmark)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-sm text-gray-300 aria-selected:bg-gray-800 aria-selected:text-gray-100 data-[selected=true]:bg-gray-800 hover:bg-gray-800"
                >
                  <Favicon src={bookmark.favicon_url} />
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-gray-200">
                      {bookmark.title ?? bookmark.url}
                    </p>
                    <p className="truncate text-xs text-gray-500">{bookmark.url}</p>
                  </div>
                  <ExternalLink
                    size={12}
                    className="text-gray-600 flex-shrink-0"
                    strokeWidth={1.5}
                  />
                </Command.Item>
              ))}
            </Command.Group>
            <div ref={sentinelRef} className="h-1" />
            {isFetchingNextPage && (
              <div className="flex justify-center py-3">
                <Spinner size="sm" />
              </div>
            )}
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
