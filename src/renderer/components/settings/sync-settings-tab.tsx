import { useState } from 'react';
import { SyncConnectForm } from './sync-connect-form';
import { SyncConnectedCard } from './sync-connected-card';
import { useSyncConfigQuery } from '@renderer/hooks/queries/use-sync-config-query';
import { useConnectRepoMutation } from '@renderer/hooks/mutations/use-connect-repo-mutation';
import { useDisconnectRepoMutation } from '@renderer/hooks/mutations/use-disconnect-repo-mutation';

export function SyncSettingsTab() {
  const [connectError, setConnectError] = useState<string | null>(null);

  const { data: config } = useSyncConfigQuery();
  const { mutateAsync: connectRepo, isPending: isConnecting } = useConnectRepoMutation();
  const { mutateAsync: disconnectRepo, isPending: isDisconnecting } = useDisconnectRepoMutation();

  const handleConnect = async (repoUrl: string, token: string) => {
    setConnectError(null);
    try {
      await connectRepo({ repoUrl, token });
    } catch (err) {
      setConnectError(err instanceof Error ? err.message : 'Failed to connect');
    }
  };

  const handleDisconnect = async () => {
    await disconnectRepo();
  };

  return (
    <div className="flex flex-col gap-6">
      <p className="text-xs text-gray-500">
        {config
          ? 'Successfully connected to a Git repository.'
          : 'Sync your bookmarks across devices using a private GitHub repository.'}
      </p>

      {config ? (
        <SyncConnectedCard
          repoUrl={config.repoUrl}
          lastPushedAt={config.lastPushedAt}
          lastPulledAt={config.lastPulledAt}
          isDisconnecting={isDisconnecting}
          onDisconnect={handleDisconnect}
        />
      ) : (
        <SyncConnectForm
          onConnect={handleConnect}
          isConnecting={isConnecting}
          error={connectError}
        />
      )}
    </div>
  );
}
