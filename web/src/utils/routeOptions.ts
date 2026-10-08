import type { Route } from '@/types';

/** Papel de uma rota entre as opções que o usuário pode comparar. */
export type RouteTag = 'best' | 'safest' | 'fastest' | 'alternative';

export const ROUTE_TAG_LABELS: Record<RouteTag, string> = {
  best: 'Mais segura e rápida',
  safest: 'Mais segura',
  fastest: 'Mais rápida',
  alternative: 'Alternativa',
};

/** Menor risco geral; no empate, a mais rápida. É a escolha padrão do app. */
export function safestRoute<T extends Route>(routes: readonly T[]): T | undefined {
  return sortBySafety(routes)[0];
}

export function fastestRoute<T extends Route>(routes: readonly T[]): T | undefined {
  return [...routes].sort((a, b) => a.durationMinutes - b.durationMinutes)[0];
}

export function routeTag(route: Route, routes: readonly Route[]): RouteTag {
  const isSafest = safestRoute(routes)?.id === route.id;
  const isFastest = fastestRoute(routes)?.id === route.id;
  if (isSafest && isFastest) return 'best';
  if (isSafest) return 'safest';
  if (isFastest) return 'fastest';
  return 'alternative';
}

/** Ordem de exibição: da mais segura para a mais arriscada (empate: a mais rápida antes). */
export function sortBySafety<T extends Route>(routes: readonly T[]): T[] {
  return [...routes].sort(
    (a, b) => a.overallScore - b.overallScore || a.durationMinutes - b.durationMinutes,
  );
}
