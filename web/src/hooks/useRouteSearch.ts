import { useCallback, useEffect, useRef, useState } from 'react';

import { getRoute, RouteServiceError, type RouteEndpoint } from '@/services/routeService';
import type { Route } from '@/types';

const GENERIC_ERROR = 'Não foi possível calcular a rota agora. Tente novamente em instantes.';

export interface RouteSearchState {
  loading: boolean;
  error: string | null;
  /** Resolve com a rota, ou `null` se falhou ou foi cancelada (o erro fica em `error`). */
  search: (origin: RouteEndpoint, destination: RouteEndpoint) => Promise<Route | null>;
  clearError: () => void;
}

export function useRouteSearch(): RouteSearchState {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  // Sair da página no meio da busca cancela as requisições ao Mapbox.
  useEffect(() => () => controllerRef.current?.abort(), []);

  const search = useCallback(async (origin: RouteEndpoint, destination: RouteEndpoint) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      return await getRoute(origin, destination, controller.signal);
    } catch (caught) {
      if (controller.signal.aborted) return null;
      setError(caught instanceof RouteServiceError ? caught.message : GENERIC_ERROR);
      return null;
    } finally {
      if (controllerRef.current === controller) setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { loading, error, search, clearError };
}
