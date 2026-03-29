import type { ReactNode } from 'react';
import { TitleBar } from './title-bar';
import { Sidebar } from './sidebar';
import { SidebarResizeHandle } from './sidebar-resize-handle';
import { useSidebarWidth } from '@renderer/hooks/use-sidebar-width';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { sidebarWidth, updateWidth, persistWidth } = useSidebarWidth();

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-950">
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar style={{ width: sidebarWidth }} />
        <SidebarResizeHandle
          sidebarWidth={sidebarWidth}
          onResize={updateWidth}
          onResizeEnd={persistWidth}
        />
        <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
