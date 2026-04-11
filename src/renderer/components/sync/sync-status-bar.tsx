interface SyncStatusBarProps {
  repoUrl: string;
  lastSyncedAt: string | null;
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function displayRepoUrl(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\.git$/, '');
}

export function SyncStatusBar({ repoUrl, lastSyncedAt }: SyncStatusBarProps) {
  return (
    <div className="px-4 py-3 border-b border-gray-800">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
        <span className="text-xs font-medium text-green-400">Connected</span>
      </div>
      <p className="text-xs text-gray-500 mt-0.5 truncate">{displayRepoUrl(repoUrl)}</p>
      {lastSyncedAt && (
        <p className="text-xs text-gray-600 mt-1">
          Last synced {formatRelativeTime(lastSyncedAt)}
        </p>
      )}
    </div>
  );
}
