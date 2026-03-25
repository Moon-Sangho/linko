import { useUIStore } from '@renderer/store/use-ui-store';
import { useDebouncedValue } from '@renderer/hooks/use-debounced-value';

const DEBOUNCE_MS = 500;

/**
 * Reads search state from UIStore and debounces the text query.
 * tagIds are returned as-is (no delay — tag selection should be immediate).
 */
export function useSearchBookmark() {
  const { searchQuery, setSearchQuery, selectedTagIds } = useUIStore();
  const debouncedQuery = useDebouncedValue(searchQuery, DEBOUNCE_MS);

  return {
    searchQuery,
    setSearchQuery,
    debouncedQuery,
    selectedTagIds,
  };
}
