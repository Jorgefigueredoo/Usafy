import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { Route } from '@/types';
import { safestRoute } from '@/utils/routeOptions';

import { RouteContext } from './routeContext';

const STORAGE_KEY = 'usafy:current-route';
const ALTERNATIVES_KEY = 'usafy:route-alternatives';

/** Checagem mínima: protege contra dados antigos/corrompidos no storage. */
function isRoute(value: unknown): value is Route {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<Record<keyof Route, unknown>>;
  return (
    typeof candidate.id === 'string' &&
    Array.isArray(candidate.geometry) &&
    Array.isArray(candidate.segments) &&
    Array.isArray(candidate.maneuvers) &&
    typeof candidate.overallScore === 'number'
  );
}

// O storage pode lançar (aba anônima, cota cheia); nesses casos só não persistimos.
function readStoredRoute(): Route | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isRoute(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function readStoredAlternatives(): Route[] {
  try {
    const raw = sessionStorage.getItem(ALTERNATIVES_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.every(isRoute) ? parsed : [];
  } catch {
    return [];
  }
}

interface RouteState {
  route: Route | null;
  alternatives: Route[];
}

function readStoredState(): RouteState {
  const route = readStoredRoute();
  const alternatives = readStoredAlternatives();
  // Opções guardadas só valem se a rota escolhida estiver entre elas.
  return { route, alternatives: alternatives.some((option) => option.id === route?.id) ? alternatives : [] };
}

function storeState({ route, alternatives }: RouteState): void {
  try {
    if (route) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(route));
    else sessionStorage.removeItem(STORAGE_KEY);
    if (alternatives.length > 0) sessionStorage.setItem(ALTERNATIVES_KEY, JSON.stringify(alternatives));
    else sessionStorage.removeItem(ALTERNATIVES_KEY);
  } catch {
    // Sem persistência: a rota continua disponível em memória.
  }
}

export interface RouteProviderProps {
  children: ReactNode;
}

/**
 * Guarda a rota escolhida e as opções da busca para Map e RouteDetails, sobrevivendo a um
 * recarregamento.
 */
export function RouteProvider({ children }: RouteProviderProps) {
  const [state, setState] = useState<RouteState>(readStoredState);

  useEffect(() => storeState(state), [state]);

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
