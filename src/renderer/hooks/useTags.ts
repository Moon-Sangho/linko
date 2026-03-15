import { useEffect } from 'react';
import { useTagStore } from '../store/useTagStore';

export function useTags() {
  const { tags, isLoading, error, fetchAll, create, delete: deleteTag } = useTagStore();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    tags,
    isLoading,
    error,
    create,
    delete: deleteTag,
    refetch: fetchAll,
  };
}
