import { Spinner } from '@renderer/components/ui/spinner';

interface SyncConnectedCardProps {
  repoUrl: string;
  lastPushedAt: string | null;
  lastPulledAt: string | null;
  isDisconnecting: boolean;
  onDisconnect: () => void;
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function displayRepoUrl(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\.git$/, '');
}

export function SyncConnectedCard({
  repoUrl,
  lastPushedAt,
  lastPulledAt,
  isDisconnecting,
  onDisconnect,
}: SyncConnectedCardProps) {
  return (
    <div className="flex flex-col gap-3 p-4 bg-gray-800 rounded-lg border border-gray-700">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
          <span className="text-xs font-medium text-green-400">Connected</span>
        </div>
      </div>

      <p className="text-xs text-gray-400 truncate">{displayRepoUrl(repoUrl)}</p>

      <div className="flex flex-col gap-1">
        {lastPushedAt && (
          <p className="text-xs text-gray-500">Last pushed: {formatDate(lastPushedAt)}</p>
        )}
        {lastPulledAt && (
          <p className="text-xs text-gray-500">Last pulled: {formatDate(lastPulledAt)}</p>
        )}
      </div>

      <button
        onClick={onDisconnect}
        disabled={isDisconnecting}
        className="flex items-center justify-center gap-2 h-7 px-3 text-xs font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-gray-700 rounded-md transition-colors disabled:opacity-50"
      >
        {isDisconnecting && <Spinner size="sm" />}
        Disconnect
      </button>
    </div>
  );
}
