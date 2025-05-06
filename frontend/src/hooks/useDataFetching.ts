import { useState, useEffect, useCallback } from 'react';
import useAppStore from '../store/appStore';

// 通用数据获取hook
function useDataFetching<T>(
  fetchFn: (...args: any[]) => Promise<T>,
  initialArgs: any[] = [],
  immediate: boolean = true
) {
  const [data, setData] = useState<T | null>(null);
  const { setLoading, setError } = useAppStore();

  const fetchData = useCallback(
    async (...args: any[]) => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchFn(...args);
        setData(result);
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetchFn, setLoading, setError]
  );

  useEffect(() => {
    if (immediate) {
      fetchData(...initialArgs);
    }
  }, [immediate, ...initialArgs]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, fetchData, setData };
}

export default useDataFetching;