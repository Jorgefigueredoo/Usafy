import { useCallback, useMemo, useState, type ReactNode } from 'react';

import type { Route } from '@/types';
import { safestRoute } from '@/utils/routeOptions';

import { RouteContext } from './routeContext';

interface RouteState {
  route: Route | null;
  alternatives: Route[];
}

export interface RouteProviderProps {
  children: ReactNode;
}

/**
 * Guarda a rota escolhida e as opções da busca para Mapa e Detalhes. No app nativo a memória
 * sobrevive à navegação entre telas; não precisa do sessionStorage do web.
 */
export function RouteProvider({ children }: RouteProviderProps) {
  const [state, setState] = useState<RouteState>({ route: null, alternatives: [] });

  const setRoute = useCallback((next: Route | null) => {
    setState((current) => {
      const keepOptions = next !== null && current.alternatives.some((option) => option.id === next.id);
      return { route: next, alternatives: keepOptions ? current.alternatives : [] };
    });
  }, []);

  const setRouteOptions = useCallback((routes: Route[]) => {
    setState({ route: safestRoute(routes) ?? null, alternatives: routes.length > 1 ? routes : [] });
  }, []);

  const value = useMemo(
    () => ({ route: state.route, alternatives: state.alternatives, setRoute, setRouteOptions }),
    [state, setRoute, setRouteOptions],
  );

  return <RouteContext.Provider value={value}>{children}</RouteContext.Provider>;
}
