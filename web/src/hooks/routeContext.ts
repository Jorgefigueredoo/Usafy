import { createContext } from 'react';

import type { Route } from '@/types';

export interface RouteContextValue {
  /** Rota escolhida: a que o mapa desenha e a navegação segue. */
  route: Route | null;
  /** Todas as opções da última busca (incluindo `route`); vazia quando só há uma. */
  alternatives: Route[];
  /** Troca a rota. Uma rota que não está entre as opções (ex.: recálculo) descarta as opções. */
  setRoute: (route: Route | null) => void;
  /** Resultado de uma busca: guarda as opções e escolhe a mais segura. */
  setRouteOptions: (routes: Route[]) => void;
}

export const RouteContext = createContext<RouteContextValue | null>(null);
