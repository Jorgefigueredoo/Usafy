import { describe, expect, it } from 'vitest';

import type { RiskLevel, Route } from '@/types';

import { fastestRoute, highRiskMeters, routeTag, safestRoute, sortBySafety } from './routeOptions';

interface RouteSpec {
  id: string;
  minutes: number;
  score: number;
  /** [nível, metros] de cada trecho. */
  segments?: [RiskLevel, number][];
}

function makeRoute({ id, minutes, score, segments = [['low', 1000]] }: RouteSpec): Route {
  return {
    id,
    origin: 'Boa Viagem',
    destination: 'RioMar Recife',
    overallRisk: score < 34 ? 'low' : score < 67 ? 'medium' : 'high',
    overallScore: score,
    durationMinutes: minutes,
    distanceKm: segments.reduce((total, [, meters]) => total + meters, 0) / 1000,
    geometry: [],
    segments: segments.map(([riskLevel, distanceMeters], index) => ({
      id: `segment-${index + 1}`,
      name: `Trecho ${index + 1}`,
      riskLevel,
      riskScore: 0,
      distanceMeters,
      coordinates: [],
      factors: [],
    })),
    maneuvers: [],
  };
}

describe('highRiskMeters', () => {
  it('soma só os trechos de risco alto', () => {
    const route = makeRoute({
      id: 'a',
      minutes: 10,
      score: 40,
      segments: [
        ['high', 300],
        ['low', 1000],
        ['high', 200],
        ['medium', 500],
      ],
    });
    expect(highRiskMeters(route)).toBe(500);
  });
});

describe('safestRoute', () => {
  it('não escolhe a rota com trecho de risco alto só porque a média é menor', () => {
    // Caso real do teste Boa Viagem → RioMar: a média escondia 1,3 km de risco alto.
    const averageLooksSafe = makeRoute({
      id: 'media-baixa',
      minutes: 17,
      score: 32,
      segments: [
        ['low', 1300],
        ['high', 1300],
        ['low', 3700],
      ],
    });
    const noHighRisk = makeRoute({
      id: 'sem-risco-alto',
      minutes: 12,
      score: 35,
      segments: [
        ['low', 3000],
        ['medium', 3000],
      ],
    });
    expect(safestRoute([averageLooksSafe, noHighRisk])?.id).toBe('sem-risco-alto');
  });

  it('prefere menos distância em risco alto, mesmo com média pior', () => {
    const long = makeRoute({ id: 'longo', minutes: 10, score: 30, segments: [['high', 1200]] });
    const short = makeRoute({ id: 'curto', minutes: 10, score: 50, segments: [['high', 200]] });
    expect(safestRoute([long, short])?.id).toBe('curto');
  });

  it('sem risco alto em nenhuma, decide pela menor média', () => {
    const a = makeRoute({ id: 'a', minutes: 10, score: 45 });
    const b = makeRoute({ id: 'b', minutes: 20, score: 20 });
    expect(safestRoute([a, b])?.id).toBe('b');
  });

  it('diferença de poucos metros em risco alto conta como empate', () => {
    const a = makeRoute({ id: 'a', minutes: 10, score: 60, segments: [['high', 500]] });
    const b = makeRoute({ id: 'b', minutes: 10, score: 40, segments: [['high', 503]] });
    expect(safestRoute([a, b])?.id).toBe('b');
  });

  it('empate em tudo: vence a mais rápida', () => {
    const slow = makeRoute({ id: 'lenta', minutes: 25, score: 30 });
    const quick = makeRoute({ id: 'rapida', minutes: 15, score: 30 });
    expect(safestRoute([slow, quick])?.id).toBe('rapida');
  });

  it('lista vazia não tem rota mais segura', () => {
    expect(safestRoute([])).toBeUndefined();
  });
});

describe('sortBySafety', () => {
  it('ordena da mais segura para a menos segura sem alterar a lista original', () => {
    const risky = makeRoute({ id: 'arriscada', minutes: 8, score: 70, segments: [['high', 2000]] });
    const medium = makeRoute({ id: 'media', minutes: 10, score: 50 });
    const safe = makeRoute({ id: 'segura', minutes: 12, score: 20 });
    const original = [risky, medium, safe];

    expect(sortBySafety(original).map((route) => route.id)).toEqual(['segura', 'media', 'arriscada']);
    expect(original.map((route) => route.id)).toEqual(['arriscada', 'media', 'segura']);
  });
});

describe('routeTag', () => {
  const safe = makeRoute({ id: 'segura', minutes: 20, score: 20 });
  const fast = makeRoute({ id: 'rapida', minutes: 12, score: 60, segments: [['high', 800]] });
  const other = makeRoute({ id: 'outra', minutes: 18, score: 45, segments: [['high', 900]] });

  it('marca a mais segura, a mais rápida e as demais', () => {
    const options = [safe, fast, other];
    expect(routeTag(safe, options)).toBe('safest');
    expect(routeTag(fast, options)).toBe('fastest');
    expect(routeTag(other, options)).toBe('alternative');
  });

  it('quando a mais segura também é a mais rápida, é a melhor das duas', () => {
    const best = makeRoute({ id: 'melhor', minutes: 10, score: 15 });
    expect(routeTag(best, [best, fast])).toBe('best');
    expect(fastestRoute([best, fast])?.id).toBe('melhor');
  });
});
