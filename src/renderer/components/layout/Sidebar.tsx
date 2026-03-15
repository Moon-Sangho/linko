import { useCallback, useState } from 'react';
import { Plus, Upload } from 'lucide-react';
import { SearchBar } from '../search/SearchBar';
import { TagFilter } from '../tag/TagFilter';
import { useUIStore } from '../../store/useUIStore';
import { useBookmarkStore } from '../../store/useBookmarkStore';
import { IpcChannels } from '@shared/ipc-channels';
import type { ImportSummary, IpcResult } from '@shared/types';

export function Sidebar() {
  const { openAddModal } = useUIStore();
  const { fetchAll } = useBookmarkStore();
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleImport = useCallback(async () => {
    setImportStatus('Importing…');
    try {
      const result = await window.electron.invoke(IpcChannels.FS_IMPORT_BOOKMARKS) as IpcResult<ImportSummary>;
      if (result.success && result.data) {
        const { added, skipped } = result.data;
        setImportStatus(`Imported ${added} (${skipped} skipped)`);
        fetchAll();
        setTimeout(() => setImportStatus(null), 4000);
      } else if (result.error && result.error !== 'No file selected') {
        setImportStatus('Import failed');
        setTimeout(() => setImportStatus(null), 3000);
      } else {
        setImportStatus(null);
      }
    } catch {
      setImportStatus('Import failed');
      setTimeout(() => setImportStatus(null), 3000);
    }
  }, [fetchAll]);

  return (
    <div className="w-56 flex-shrink-0 flex flex-col bg-gray-900 border-r border-gray-800 h-full">
      {/* Search */}
      <SearchBar />

      {/* Tags */}
      <div className="flex-1 overflow-y-auto">
        <TagFilter />
      </div>

      {/* Footer buttons */}
      <div className="px-3 py-3 border-t border-gray-800 flex flex-col gap-1.5">
        {importStatus && (
          <p className="text-xs text-gray-400 text-center">{importStatus}</p>
        )}
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
        <button
          onClick={handleImport}
          className="
            w-full flex items-center justify-center gap-2
            h-7 text-xs font-medium
            text-gray-400 hover:text-gray-200 hover:bg-gray-800
            rounded-md transition-colors duration-75
          "
        >
          <Upload size={12} strokeWidth={1.5} />
          Import from browser…
        </button>
      </div>
    </div>
  );
}
