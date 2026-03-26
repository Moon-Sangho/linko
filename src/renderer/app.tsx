import { AppShell } from './components/layout/app-shell';
import { BookmarkList } from './components/bookmark/bookmark-list';
import { OverlayProvider } from './overlay/overlay-provider';
import { useKeyboardShortcuts } from './hooks/use-keyboard-shortcuts';
import { useFaviconUpdateListener } from './hooks/use-favicon-update-listener';

export default function App() {
  useKeyboardShortcuts();
  useFaviconUpdateListener();

  return (
    <>
      <AppShell>
        <BookmarkList />
      </AppShell>
      <OverlayProvider />
    </>
  );
}
