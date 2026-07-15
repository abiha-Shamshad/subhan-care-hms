import { useState, useEffect, useCallback } from 'react';

/**
 * Fetch-on-mount wrapper around a service call, replacing the old
 * useState(INITIAL_*) mock-data pattern with a real API resource.
 *
 * @param {() => Promise<any>} fetcher
 * @param {Array} deps - re-fetches whenever these change (mirrors useEffect deps)
 */
const useApiResource = (fetcher, deps = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    return fetcher()
      .then((result) => setData(result))
      .catch((err) => setError(err.message || 'Failed to load data.'))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, setData, loading, error, refetch };
};

export default useApiResource;
