import type { Coordinate, Route, RouteSegment } from '@/types';
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

/** Centro do Recife, usado só se a rota vier sem trechos. */
const FALLBACK_COORDINATE: Coordinate = [-34.877, -8.0476];

/**
 * Os trechos do mock vêm de bairros distantes; para a linha no mapa ficar
 * contínua, cada trecho começa onde o anterior terminou.
 */
function connectSegments(segments: RouteSegment[]): RouteSegment[] {
  return segments.map((segment, index) => {
    const previous = segments[index - 1];
    const previousEnd = previous?.coordinates[previous.coordinates.length - 1];
    return previousEnd ? { ...segment, coordinates: [previousEnd, ...segment.coordinates] } : segment;
  });
}

export function buildMockRoute(origin: string, destination: string): Route {
  const hash = hashInput(`${origin}>${destination}`.toLowerCase());

  const segments = connectSegments(
    [LOW_RISK_SEEDS, MEDIUM_RISK_SEEDS, HIGH_RISK_SEEDS]
      .map((seeds) => pickSeed(seeds, hash))
      .filter((seed): seed is SegmentSeed => seed !== undefined)
      .map(toSegment),
  );
  const originCoordinate = segments[0]?.coordinates[0] ?? FALLBACK_COORDINATE;
  const lastCoordinates = segments[segments.length - 1]?.coordinates ?? [];
  const destinationCoordinate = lastCoordinates[lastCoordinates.length - 1] ?? FALLBACK_COORDINATE;

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
    originCoordinate,
    destinationCoordinate,
  };
}
