import { useMutation, useQueryClient } from '@tanstack/react-query';
import { IpcChannels } from '@shared/ipc-channels';
import type { ImportSummary, IpcResult } from '@shared/types';
import { queryKeys } from '@renderer/lib/query-keys';

export function useImportBookmarksMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const result = (await window.electron.invoke(
        IpcChannels.FS_IMPORT_BOOKMARKS,
      )) as IpcResult<ImportSummary>;
      if (!result.success) {
        if (result.error === 'No file selected') return null; // user cancelled
        throw new Error(result.error ?? 'Import failed');
      }
      return result.data ?? null;
    },
    onSuccess: (data: ImportSummary | null) => {
      if (!data) return; // cancelled
      queryClient.invalidateQueries({ queryKey: queryKeys.bookmark.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookmark.searches });
    },
  });
}
