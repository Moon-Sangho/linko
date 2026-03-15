import { useEffect } from 'react';
import { useTagStore } from '../store/useTagStore';
import type { CreateTagInput } from '../../shared/types';

export function useTags() {
  const { tags, isLoading, fetchAll, create, delete: deleteTag } = useTagStore();

  useEffect(() => {
    fetchAll();
  }, []);

  return {
    tags,
    isLoading,
    create: (input: CreateTagInput) => create(input),
    delete: (id: number) => deleteTag(id),
    refetch: fetchAll,
  };
}
