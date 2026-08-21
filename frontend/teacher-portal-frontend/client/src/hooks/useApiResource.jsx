import { useCallback, useEffect, useState } from 'react';
export function useApiResource(loader, options = {}) {
  const [state, setState] = useState({ data: options.initialData ?? null, loading: true, error: null });
  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try { const data = await loader(); setState({ data, loading: false, error: null }); }
    catch (error) { setState((current) => ({ ...current, loading: false, error: error?.message || 'Unable to load data.' })); }
  }, [loader]);
  useEffect(() => { load(); }, [load]);
  return { ...state, retry: load };
}
