import { useCallback, useState } from 'react';

import { RouteServiceError, getRoute } from '@/services/routeService';
import type { Route } from '@/types';

interface RouteSearchState {
  isLoading: boolean;
  error: string | null;
}

export interface UseRouteSearchResult extends RouteSearchState {
  /** Resolve com a rota, ou `null` quando houve erro (já refletido em `error`). */
  searchRoute: (origin: string, destination: string) => Promise<Route | null>;
}

const GENERIC_ERROR = 'Não foi possível calcular a rota agora. Tente novamente.';

/** Isola a tela do ciclo de vida da requisição: loading, erro e resultado. */
export function useRouteSearch(): UseRouteSearchResult {
  const [state, setState] = useState<RouteSearchState>({ isLoading: false, error: null });

  const searchRoute = useCallback(
    async (origin: string, destination: string): Promise<Route | null> => {
      setState({ isLoading: true, error: null });

      try {
        const route = await getRoute(origin, destination);
        setState({ isLoading: false, error: null });
        return route;
      } catch (error) {
        const message = error instanceof RouteServiceError ? error.message : GENERIC_ERROR;
        setState({ isLoading: false, error: message });
        return null;
      }
    },
    [],
  );

  return { ...state, searchRoute };
}
