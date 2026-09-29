import type { Route, RouteSegment } from '@/types';
import { riskLevelFromScore } from '@/utils/risk';

import {
  HIGH_RISK_SEEDS,
  LOW_RISK_SEEDS,
  MEDIUM_RISK_SEEDS,
  type SegmentSeed,
} from './segmentSeeds';

/** Velocidade média de moto no trânsito do Recife, usada para estimar o tempo. */
const AVERAGE_SPEED_KMH = 24;
const METERS_IN_KM = 1000;

/** Hash estável: a mesma origem/destino sempre devolve a mesma rota. */
function hashInput(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 100_000;
  }
  return hash;
}

function pickSeed(seeds: SegmentSeed[], hash: number): SegmentSeed | undefined {
  return seeds[hash % seeds.length];
}

function toSegment(seed: SegmentSeed, index: number): RouteSegment {
  return {
    ...seed,
    id: `seg-${index + 1}`,
    riskLevel: riskLevelFromScore(seed.riskScore),
  };
}

export function buildMockRoute(origin: string, destination: string): Route {
  const hash = hashInput(`${origin}>${destination}`.toLowerCase());

  const segments = [LOW_RISK_SEEDS, MEDIUM_RISK_SEEDS, HIGH_RISK_SEEDS]
    .map((seeds) => pickSeed(seeds, hash))
    .filter((seed): seed is SegmentSeed => seed !== undefined)
    .map(toSegment);

  const distanceMeters = segments.reduce((total, segment) => total + segment.distanceMeters, 0);
  const distanceKm = distanceMeters / METERS_IN_KM;

  // Score geral ponderado pela distância: um trecho curto e perigoso não deve
  // pesar o mesmo que um longo e tranquilo.
  const weightedScore =
    distanceMeters === 0
      ? 0
      : segments.reduce((total, s) => total + s.riskScore * s.distanceMeters, 0) / distanceMeters;

  return {
    id: `route-${hash}`,
    origin,
    destination,
    overallRisk: riskLevelFromScore(weightedScore),
    overallScore: Math.round(weightedScore),
    durationMinutes: Math.round((distanceKm / AVERAGE_SPEED_KMH) * 60),
    distanceKm,
    segments,
  };
}
