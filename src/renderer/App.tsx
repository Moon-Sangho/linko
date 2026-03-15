import { AppShell } from './components/layout/AppShell';
import { CommandPalette } from './components/search/CommandPalette';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { BookmarkList } from './components/bookmark/BookmarkList';
import { AddBookmarkModal } from './components/bookmark/AddBookmarkModal';
import { EditBookmarkModal } from './components/bookmark/EditBookmarkModal';

export default function App() {
  useKeyboardShortcuts();

  return (
    <>
      <AppShell>
        <BookmarkList />
      </AppShell>

      <AddBookmarkModal />
      <EditBookmarkModal />

      <CommandPalette />
    </>
  );
}
