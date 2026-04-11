import { useQuery } from '@tanstack/react-query';
import { IpcChannels } from '@shared/ipc-channels';
import type { SyncDiff } from '@shared/types/domains';
import { queryKeys } from '@renderer/lib/query-keys';

export function useSyncDiffQuery() {
  return useQuery({
    queryKey: queryKeys.sync.diff(),
    queryFn: () =>
      window.electron.invoke(IpcChannels.SYNC_GET_DIFF) as Promise<SyncDiff>,
  });
}
