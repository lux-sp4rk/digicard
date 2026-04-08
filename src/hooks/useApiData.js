import { useState, useEffect } from 'react';

/**
 * Generic API fetch hook with loading + attempted tracking.
 * Only fetches when enabled=true (avoids unnecessary network calls).
 * @param {() => Promise<any>} fetchFn - The fetch function to call
 * @param {boolean} enabled - Whether to trigger the fetch
 * @returns {{ data: any, loading: boolean, attempted: boolean }}
 */
export const useApiData = (fetchFn, enabled = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      setAttempted(true);
      const result = await fetchFn();
      if (!cancelled) {
        setData(result);
      }
      setLoading(false);
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { data, loading, attempted };
};
