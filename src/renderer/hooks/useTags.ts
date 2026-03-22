import { useTagsQuery } from '@renderer/hooks/queries/useTagsQuery';
import { useCreateTagMutation } from '@renderer/hooks/mutations/useCreateTagMutation';
import { useDeleteTagMutation } from '@renderer/hooks/mutations/useDeleteTagMutation';

export function useTags() {
  const { data: tags = [], isLoading, error } = useTagsQuery();
  const createMutation = useCreateTagMutation();
  const deleteMutation = useDeleteTagMutation();

  return {
    tags,
    isLoading,
    error: error?.message ?? null,
    create: createMutation.mutateAsync,
    delete: (id: number) => deleteMutation.mutateAsync(id),
  };
}
