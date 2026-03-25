import { useEffect, useMemo, useState } from 'react';
import { debounce } from '@renderer/utils/debounce';

export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  const update = useMemo(() => debounce(setDebounced, { delay }), [delay]);

  useEffect(() => {
    update(value);
  }, [value, update]);

  return debounced;
}
