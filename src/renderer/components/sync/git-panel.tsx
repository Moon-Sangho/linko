import { useState } from 'react';
import { GitPanelHeader } from './git-panel-header';
import { SyncStatusBar } from './sync-status-bar';
import { SyncActions } from './sync-actions';
import { SyncDiffList } from './sync-diff-list';
import { PullOverwriteModal } from './pull-overwrite-modal';
import { SyncModal } from './sync-modal';
import { useSyncStatusQuery } from '@renderer/hooks/queries/use-sync-status-query';
import { useSyncDiffQuery } from '@renderer/hooks/queries/use-sync-diff-query';
import { usePushMutation } from '@renderer/hooks/mutations/use-push-mutation';
import { usePullMutation } from '@renderer/hooks/mutations/use-pull-mutation';
import { overlay } from '@renderer/overlay/control';
import { GithubIcon } from '@renderer/components/ui/github-icon';

interface GitPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GitPanel({ isOpen, onClose }: GitPanelProps) {
  const [showPullWarning, setShowPullWarning] = useState(false);

  const { data: syncStatus } = useSyncStatusQuery();
  const { data: syncDiff } = useSyncDiffQuery();
  const { mutateAsync: push, isPending: isPushing } = usePushMutation();
  const { mutateAsync: pull, isPending: isPulling } = usePullMutation();

  if (!isOpen) return null;

  const isConnected = syncStatus?.isConnected ?? false;
  const unsyncedCount = syncStatus?.unsyncedCount ?? 0;

  const handlePull = () => {
    if (unsyncedCount > 0) {
      setShowPullWarning(true);
    } else {
      pull();
    }
  };

  const handlePullConfirm = async () => {
    await pull();
    setShowPullWarning(false);
  };

  return (
    <>
      <div className="w-72 flex-shrink-0 flex flex-col bg-gray-900 border-l border-gray-800 h-full">
        <GitPanelHeader onClose={onClose} />

        {isConnected && syncStatus?.repoUrl ? (
          <>
            <SyncStatusBar
              repoUrl={syncStatus.repoUrl}
              lastSyncedAt={syncStatus.lastSyncedAt}
            />
            <SyncActions
              isPushing={isPushing}
              isPulling={isPulling}
              isDisabled={!isConnected}
              onPush={() => push()}
              onPull={handlePull}
            />
            {syncDiff && (
              <SyncDiffList
                added={syncDiff.added}
                modified={syncDiff.modified}
                deleted={syncDiff.deleted}
              />
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4">
            <GithubIcon size={32} className="text-gray-600" />
            <p className="text-xs text-gray-500 text-center">
              Not connected to a Git repository.
            </p>
            <button
              onClick={() =>
                overlay.open(({ isOpen, close }) => <SyncModal isOpen={isOpen} onClose={close} />)
              }
              className="h-7 px-3 text-xs font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors duration-75"
            >
              Connect repository
            </button>
          </div>
        )}
      </div>

      <PullOverwriteModal
        isOpen={showPullWarning}
        unsyncedCount={unsyncedCount}
        isPulling={isPulling}
        onConfirm={handlePullConfirm}
        onClose={() => setShowPullWarning(false)}
      />
    </>
  );
}
