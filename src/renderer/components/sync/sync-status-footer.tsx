import { GitBranch, CheckCircle, ChevronRight } from 'lucide-react';
import { overlay } from '@renderer/overlay/control';
import { useSyncConfigQuery } from '@renderer/hooks/queries/use-sync-config-query';
import { SyncModal } from './sync-modal';

function parseRepoSlug(repoUrl: string): string {
  // https://github.com/user/repo.git → user/repo
  return repoUrl
    .replace(/^https?:\/\/[^/]+\//, '')
    .replace(/\.git$/, '');
}

export function SyncStatusFooter() {
  const { data: config } = useSyncConfigQuery();

  const handleClick = () => {
    overlay.open(({ isOpen, close }) => <SyncModal isOpen={isOpen} onClose={close} />);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      className="px-3 py-2.5 border-t border-gray-800 flex items-center gap-2 cursor-pointer hover:bg-gray-800/50 transition-colors duration-75 group"
    >
      <GitBranch
        size={13}
        strokeWidth={1.5}
        className={config ? 'text-gray-400' : 'text-gray-600'}
      />
      {config ? (
        <>
          <span className="flex-1 text-xs text-gray-400 truncate min-w-0">
            {parseRepoSlug(config.repoUrl)}
          </span>
          <CheckCircle size={12} strokeWidth={1.5} className="text-green-500 flex-shrink-0" />
        </>
      ) : (
        <>
          <span className="flex-1 text-xs text-gray-600 group-hover:text-gray-500 transition-colors">
            Git sync not connected
          </span>
          <ChevronRight size={12} strokeWidth={1.5} className="text-gray-700 group-hover:text-gray-500 flex-shrink-0 transition-colors" />
        </>
      )}
    </div>
  );
}
