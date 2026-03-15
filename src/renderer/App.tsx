import { useEffect } from 'react';
import { AppShell } from './components/layout/AppShell';
import { CommandPalette } from './components/search/CommandPalette';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useSearch } from './hooks/useSearch';
import { useBookmarkStore } from './store/useBookmarkStore';
import { useUIStore } from './store/useUIStore';

// Placeholder components for those implemented by other agents
import { BookmarkList } from './components/bookmark/BookmarkList';
import { AddBookmarkModal } from './components/bookmark/AddBookmarkModal';
import { EditBookmarkModal } from './components/bookmark/EditBookmarkModal';

export default function App() {
  useKeyboardShortcuts();
  useSearch();

  const { fetchAll } = useBookmarkStore();
  const { isAddModalOpen, isEditModalOpen, editingBookmark, closeAddModal, closeEditModal } = useUIStore();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <>
      <AppShell>
        <BookmarkList />
      </AppShell>

      {isAddModalOpen && <AddBookmarkModal onClose={closeAddModal} />}

      {isEditModalOpen && editingBookmark && (
        <EditBookmarkModal bookmark={editingBookmark} onClose={closeEditModal} />
      )}

      <CommandPalette />
    </>
  );
}
