import { useState, useCallback } from "react";

interface UsePaginationOptions {
  initialPage?: number;
  pageSize?: number;
}

/**
 * usePagination — manages current page state.
 */
export function usePagination({ initialPage = 1, pageSize = 10 }: UsePaginationOptions = {}) {
  const [page, setPage] = useState(initialPage);

  const goToPage = useCallback((p: number) => {
    setPage(p);
  }, []);

  const reset = useCallback(() => {
    setPage(1);
  }, []);

  return { page, pageSize, goToPage, reset };
}
