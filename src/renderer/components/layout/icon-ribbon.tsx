import { Download, GitBranch } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { cn } from '@renderer/lib/cn';
import { useSyncStatusQuery } from '@renderer/hooks/queries/use-sync-status-query';

interface IconRibbonProps {
  onGitToggle: () => void;
  isGitPanelOpen: boolean;
}

interface RibbonButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isActive?: boolean;
}

function RibbonButton({ icon, label, onClick, isActive }: RibbonButtonProps) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button
          onClick={onClick}
          className={cn(
            'w-7 h-7 flex items-center justify-center rounded transition-colors duration-75',
            isActive
              ? 'bg-gray-700 text-white'
              : 'text-gray-500 hover:text-gray-300 hover:bg-gray-700/60',
          )}
          aria-label={label}
        >
          {icon}
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          side="right"
          sideOffset={8}
          className="bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg border border-gray-700 z-50"
        >
          {label}
          <Tooltip.Arrow className="fill-gray-800" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

export function IconRibbon({ onGitToggle, isGitPanelOpen }: IconRibbonProps) {
  const { data: syncStatus } = useSyncStatusQuery();
  const hasChanges = (syncStatus?.unsyncedCount ?? 0) > 0;

  return (
    <Tooltip.Provider delayDuration={400}>
      <div className="w-11 flex-shrink-0 flex flex-col items-center py-2 gap-1 bg-gray-900 border-r border-gray-800/50">
        <RibbonButton
          icon={<Download size={16} strokeWidth={1.5} />}
          label="Import from browser"
          onClick={() => {
            window.dispatchEvent(new CustomEvent('ribbon:import'));
          }}
        />
        <RibbonButton
          icon={
            <span className="relative">
              <GitBranch size={16} strokeWidth={1.5} />
              {hasChanges && (
                <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-green-400" />
              )}
            </span>
          }
          label="Git Sync"
          onClick={onGitToggle}
          isActive={isGitPanelOpen}
        />
      </div>
    </Tooltip.Provider>
  );
}
