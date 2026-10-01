import { useCallback, useMemo, useState, type ReactNode } from 'react';

import type { Route } from '@/types';

import { RouteContext } from './routeContext';

const STORAGE_KEY = 'usafy:current-route';

/** Checagem mínima: protege contra dados antigos/corrompidos no storage. */
function isRoute(value: unknown): value is Route {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<Record<keyof Route, unknown>>;
  return (
    typeof candidate.id === 'string' &&
    Array.isArray(candidate.geometry) &&
    Array.isArray(candidate.segments) &&
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

function storeRoute(route: Route | null): void {
  try {
    if (route) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(route));
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Sem persistência: a rota continua disponível em memória.
  }
}

export interface RouteProviderProps {
  children: ReactNode;
}

/** Guarda a rota calculada para Map e RouteDetails, sobrevivendo a um recarregamento. */
export function RouteProvider({ children }: RouteProviderProps) {
  const [route, setRouteState] = useState<Route | null>(readStoredRoute);

  const setRoute = useCallback((next: Route | null) => {
    storeRoute(next);
    setRouteState(next);
  }, []);

  const value = useMemo(() => ({ route, setRoute }), [route, setRoute]);

  return <RouteContext.Provider value={value}>{children}</RouteContext.Provider>;
}
