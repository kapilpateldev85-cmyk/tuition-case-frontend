import { useCallback, useRef } from "react";

/**
 * useDebounce — debounces a callback function.
 * Returns a stable debounced version of the callback.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDebounce<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback(
    (...args: unknown[]) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => callback(...args), delay);
    },
    [callback, delay]
  ) as T;
}
