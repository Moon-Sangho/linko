import { useQuery } from '@tanstack/react-query';
import { IpcChannels } from '@shared/ipc-channels';
import type { SyncStatus } from '@shared/types/domains';
import { queryKeys } from '@renderer/lib/query-keys';

export function useSyncStatusQuery() {
  return useQuery({
    queryKey: queryKeys.sync.status(),
    queryFn: () =>
      window.electron.invoke(IpcChannels.SYNC_GET_STATUS) as Promise<SyncStatus>,
  });
}
