import { AppShell } from './components/layout/AppShell';
import { BookmarkList } from './components/bookmark/BookmarkList';
import { OverlayProvider } from './overlay/OverlayProvider';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

export default function App() {
  useKeyboardShortcuts();

  return (
    <>
      <AppShell>
        <BookmarkList />
      </AppShell>

      <OverlayProvider />
    </>
  );
}
