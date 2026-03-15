import { Plus } from 'lucide-react';
import { SearchBar } from '../search/SearchBar';
import { TagFilter } from '../tag/TagFilter';
import { useUIStore } from '../../store/useUIStore';

export function Sidebar() {
  const { openAddModal } = useUIStore();

  return (
    <div className="w-56 flex-shrink-0 flex flex-col bg-gray-900 border-r border-gray-800 h-full">
      {/* Search */}
      <SearchBar />

      {/* Tags */}
      <div className="flex-1 overflow-y-auto">
        <TagFilter />
      </div>

      {/* Add Bookmark button */}
      <div className="px-3 py-3 border-t border-gray-800">
        <button
          onClick={openAddModal}
          className="
            w-full flex items-center justify-center gap-2
            h-8 text-sm font-medium
            bg-blue-600 hover:bg-blue-500 text-white
            rounded-md transition-colors duration-75
          "
        >
          <Plus size={14} strokeWidth={1.5} />
          Add Bookmark
        </button>
      </div>
    </div>
  );
}
