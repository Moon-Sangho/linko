import { type ReactNode, useState, useEffect } from 'react';
import { TitleBar } from './title-bar';
import { Sidebar } from './sidebar';
import { SidebarResizeHandle } from './sidebar-resize-handle';
import { IconRibbon } from './icon-ribbon';
import { GitPanel } from '@renderer/components/sync/git-panel';
import { useImportBookmarksMutation } from '@renderer/hooks/mutations/use-import-bookmarks-mutation';
import { useSidebarWidth } from '@renderer/hooks/use-sidebar-width';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { sidebarWidth, updateWidth, persistWidth } = useSidebarWidth();
  const [isGitPanelOpen, setIsGitPanelOpen] = useState(false);
  const { mutateAsync: importBookmarks } = useImportBookmarksMutation();

  useEffect(() => {
    const handleImport = async () => {
      await importBookmarks();
    };

    window.addEventListener('ribbon:import', handleImport as EventListener);
    return () => {
      window.removeEventListener('ribbon:import', handleImport as EventListener);
    };
  }, [importBookmarks]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-950">
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        <IconRibbon
          onGitToggle={() => setIsGitPanelOpen((prev) => !prev)}
          isGitPanelOpen={isGitPanelOpen}
        />
        <Sidebar style={{ width: sidebarWidth }} />
        <SidebarResizeHandle
          sidebarWidth={sidebarWidth}
          onResize={updateWidth}
          onResizeEnd={persistWidth}
        />
        <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
        <GitPanel isOpen={isGitPanelOpen} onClose={() => setIsGitPanelOpen(false)} />
      </div>
    </div>
  );
}
