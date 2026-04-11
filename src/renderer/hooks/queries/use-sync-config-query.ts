import { useQuery } from '@tanstack/react-query';
import { IpcChannels } from '@shared/ipc-channels';
import type { SyncConfig } from '@shared/types/domains';
import { queryKeys } from '@renderer/lib/query-keys';

export function useSyncConfigQuery() {
  return useQuery({
    queryKey: queryKeys.sync.config(),
    queryFn: () =>
      window.electron.invoke(IpcChannels.SYNC_GET_CONFIG) as Promise<SyncConfig | null>,
  });
}
