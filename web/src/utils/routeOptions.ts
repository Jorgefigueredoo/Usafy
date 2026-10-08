import type { Route } from '@/types';

/** Papel de uma rota entre as opções que o usuário pode comparar. */
export type RouteTag = 'best' | 'safest' | 'fastest' | 'alternative';

export const ROUTE_TAG_LABELS: Record<RouteTag, string> = {
  best: 'Mais segura e rápida',
  safest: 'Mais segura',
  fastest: 'Mais rápida',
  alternative: 'Alternativa',
};

/** Diferenças menores que isto (m) em trecho de risco alto contam como empate. */
const HIGH_RISK_TOLERANCE_METERS = 10;

/** Quantos metros da rota passam por trechos de risco alto. */
export function highRiskMeters(route: Route): number {
  return route.segments
    .filter((segment) => segment.riskLevel === 'high')
    .reduce((total, segment) => total + segment.distanceMeters, 0);
}

/**
 * Ordem de segurança, critério a critério:
 * 1. menos distância em trechos de risco alto — o perigo está no trecho, e uma média boa
 *    pode esconder 1 km de rua com muitos roubos;
 * 2. menor risco geral (média ponderada pela distância);
 * 3. a mais rápida.
 */
function compareSafety(a: Route, b: Route): number {
  const highRisk =
    Math.round(highRiskMeters(a) / HIGH_RISK_TOLERANCE_METERS) -
    Math.round(highRiskMeters(b) / HIGH_RISK_TOLERANCE_METERS);
  return highRisk || a.overallScore - b.overallScore || a.durationMinutes - b.durationMinutes;
}

/** Ordem de exibição: da mais segura para a menos segura (ver `compareSafety`). */
export function sortBySafety<T extends Route>(routes: readonly T[]): T[] {
  return [...routes].sort(compareSafety);
}

/** A primeira pela ordem de segurança. É a escolha padrão do app. */
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
