import { useEffect } from 'react';
import { Command } from 'cmdk';
import { Search, ExternalLink, X } from 'lucide-react';
import { useBookmarksQuery } from '@renderer/hooks/queries/use-bookmarks-query';
import { useOpenUrlMutation } from '@renderer/hooks/mutations/use-open-url-mutation';
import type { Bookmark } from '@shared/types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const { data: bookmarks = [] } = useBookmarksQuery();
  const openUrlMutation = useOpenUrlMutation();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelect = (bookmark: Bookmark) => {
    openUrlMutation.mutate(bookmark.url);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative w-full max-w-2xl mx-4 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <Command className="flex flex-col" shouldFilter>
          {/* Input */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-700">
            <Search size={16} className="text-gray-400 flex-shrink-0" strokeWidth={1.5} />
            <Command.Input
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

          {/* Results */}
          <Command.List className="max-h-96 overflow-y-auto p-2">
            <Command.Empty className="py-8 text-center text-sm text-gray-500">
              No bookmarks found.
            </Command.Empty>

            <Command.Group heading={<span className="text-xs text-gray-500 px-2">Bookmarks</span>}>
              {bookmarks.map((bookmark) => (
                <Command.Item
                  key={bookmark.id}
                  value={`${bookmark.title ?? ''} ${bookmark.url}`}
                  onSelect={() => handleSelect(bookmark)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-sm text-gray-300 aria-selected:bg-gray-800 aria-selected:text-gray-100 data-[selected=true]:bg-gray-800 hover:bg-gray-800"
                >
                  {bookmark.favicon_url ? (
                    <img
                      src={bookmark.favicon_url}
                      alt=""
                      className="w-4 h-4 rounded-sm flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-4 h-4 bg-gray-700 rounded-sm flex-shrink-0" />
                  )}

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
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
