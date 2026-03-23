import { Search, X } from 'lucide-react';
import { useUIStore } from '@renderer/store/useUIStore';
import { overlay } from '@renderer/overlay/control';
import { CommandPalette } from '@renderer/components/search/CommandPalette';

export function SearchBar() {
  const { searchQuery, setSearchQuery } = useUIStore();

  const openCommandPalette = () => {
    overlay.open(({ isOpen, close }) => <CommandPalette isOpen={isOpen} onClose={close} />);
  };

  return (
    <div className="px-3 py-2">
      <div className="relative flex items-center">
        <Search
          size={14}
          className="absolute left-2.5 text-gray-500 pointer-events-none"
          strokeWidth={1.5}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search bookmarks…"
          className="w-full h-8 pl-8 pr-8 text-sm bg-gray-800 border border-gray-700 rounded-md text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-blue-500/30 transition-colors duration-75"
        />
        {searchQuery ? (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2 text-gray-500 hover:text-gray-300"
            aria-label="Clear search"
          >
            <X size={12} strokeWidth={1.5} />
          </button>
        ) : (
          <button
            onClick={openCommandPalette}
            className="absolute right-2 text-gray-600 hover:text-gray-400"
            aria-label="Open command palette"
            title="⌘K"
          >
            <span className="text-xs font-mono">⌘K</span>
          </button>
        )}
      </div>
    </div>
  );
}
