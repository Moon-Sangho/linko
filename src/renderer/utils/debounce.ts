/**
 * Returns a debounced version of `func` that delays invoking it until after
 * `delay` ms have elapsed since the last call.
 *
 * Wrap in useMemo at the call site to keep the timer stable across renders:
 *   const debouncedFn = useMemo(() => debounce(fn, { delay: 300 }), [fn]);
 */
export function debounce<TArgs extends unknown[]>(
  func: (...args: TArgs) => unknown,
  { delay }: { delay: number },
) {
  let timer: ReturnType<typeof setTimeout> | undefined = undefined;

  return (...args: TArgs) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
      timer = undefined;
    }, delay);
  };
}
