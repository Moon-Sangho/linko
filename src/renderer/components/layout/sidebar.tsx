import type { CSSProperties } from 'react';
import { Plus } from 'lucide-react';
import { SearchBar } from '@renderer/components/search/search-bar';
import { TagFilter } from '@renderer/components/tag/tag-filter';
import { SyncStatusFooter } from '@renderer/components/sync/sync-status-footer';
import { overlay } from '@renderer/overlay/control';
import { AddBookmarkModal } from '@renderer/components/bookmark/add-bookmark-modal';

interface SidebarProps {
  style?: CSSProperties;
}

export function Sidebar({ style }: SidebarProps) {
  const openAddModal = () => {
    overlay.open(({ isOpen, close }) => <AddBookmarkModal isOpen={isOpen} onClose={close} />);
  };

  return (
    <div className="flex-shrink-0 flex flex-col bg-gray-900 h-full" style={style}>
      {/* Search */}
      <SearchBar />

      {/* Tags */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <TagFilter />
      </div>

      {/* Add Bookmark */}
      <div className="px-3 py-3 border-t border-gray-800">
        <button
          onClick={openAddModal}
          className="w-full flex items-center justify-center gap-2 h-8 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors duration-75"
        >
          <Plus size={14} strokeWidth={1.5} />
          Add Bookmark
        </button>
      </div>

      {/* Sync status */}
      <SyncStatusFooter />
    </div>
  );
}
