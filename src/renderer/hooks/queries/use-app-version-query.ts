import { useQuery } from '@tanstack/react-query';
import { IpcChannels } from '@shared/ipc-channels';
import { queryKeys } from '@renderer/lib/query-keys';

export function useAppVersionQuery() {
  return useQuery({
    queryKey: queryKeys.app.version(),
    queryFn: () => window.electron.invoke(IpcChannels.APP_GET_VERSION) as Promise<string>,
  });
}
