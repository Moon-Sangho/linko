import { AppShell } from './components/layout/app-shell';
import { BookmarkList } from './components/bookmark/bookmark-list';
import { OverlayProvider } from './overlay/overlay-provider';
import { useKeyboardShortcuts } from './hooks/use-keyboard-shortcuts';

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
