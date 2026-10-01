import type { Route, RouteSegment } from '@/types';
import { riskLevelFromScore } from '@/utils/risk';
import { splitLineByDistance } from '@/utils/geo';

import { geocode, getDirections, type DirectionsStep } from './mapbox';
import { createSeededRandom, mockSegmentRisk } from './riskMock';
import { RouteServiceError } from './routeServiceError';

export { RouteServiceError };

const MIN_SEGMENTS = 3;
const MAX_SEGMENTS = 5;
/** Cada ~2,5 km ganha um trecho a mais, dentro do intervalo 3–5. */
const METERS_PER_EXTRA_SEGMENT = 2500;

function segmentCountFor(distanceMeters: number): number {
  const extra = Math.floor(distanceMeters / METERS_PER_EXTRA_SEGMENT);
  return Math.min(MAX_SEGMENTS, MIN_SEGMENTS + extra);
}

/**
 * Nome do trecho = rua que ocupa a maior parte dele, segundo os passos do
 * Directions. Fica "Trecho N" quando a via não tem nome no OpenStreetMap.
 */
function nameForRange(steps: DirectionsStep[], start: number, end: number, position: number): string {
  const overlapByName = new Map<string, number>();
  let stepStart = 0;

  for (const step of steps) {
    const stepEnd = stepStart + step.distanceMeters;
    const overlap = Math.min(end, stepEnd) - Math.max(start, stepStart);
    if (overlap > 0 && step.name) {
      overlapByName.set(step.name, (overlapByName.get(step.name) ?? 0) + overlap);
    }
    stepStart = stepEnd;
  }

  let bestName = '';
  let bestOverlap = 0;
  for (const [name, overlap] of overlapByName) {
    if (overlap > bestOverlap) {
      bestName = name;
      bestOverlap = overlap;
    }
  }
  return bestName || `Trecho ${position}`;
}

export async function getRoute(
  origin: string,
  destination: string,
  signal?: AbortSignal,
): Promise<Route> {
  const originQuery = origin.trim();
  const destinationQuery = destination.trim();

  if (!originQuery || !destinationQuery) {
    throw new RouteServiceError('Informe origem e destino para calcular a rota.');
  }

  const [from, to] = await Promise.all([
    geocode(originQuery, signal),
    geocode(destinationQuery, signal),
  ]);

  const directions = await getDirections(from.coordinate, to.coordinate, signal);

  if (directions.distanceMeters < 1) {
    throw new RouteServiceError('Origem e destino apontam para o mesmo lugar. Revise os endereços.');
  }

  const segmentCount = segmentCountFor(directions.distanceMeters);
  const pieces = splitLineByDistance(directions.geometry, segmentCount);
  const segmentDistance = directions.distanceMeters / pieces.length;
  const random = createSeededRandom(`${originQuery}|${destinationQuery}`.toLowerCase());

  // TODO: substituir risco mockado por cálculo real quando o backend Spring Boot estiver pronto.
  const segments: RouteSegment[] = pieces.map((coordinates, index) => {
    const start = index * segmentDistance;
    return {
      id: `segment-${index + 1}`,
      name: nameForRange(directions.steps, start, start + segmentDistance, index + 1),
      distanceMeters: segmentDistance,
      coordinates,
      ...mockSegmentRisk(random),
    };
  });

  // Média ponderada pela distância: um trecho longo pesa mais no risco geral.
  const overallScore = Math.round(
    segments.reduce((sum, segment) => sum + segment.riskScore * segment.distanceMeters, 0) /
      directions.distanceMeters,
  );

  return {
    id: crypto.randomUUID(),
    origin: originQuery,
    destination: destinationQuery,
    overallRisk: riskLevelFromScore(overallScore),
    overallScore,
    durationMinutes: directions.durationSeconds / 60,
    distanceKm: directions.distanceMeters / 1000,
    geometry: directions.geometry,
    segments,
  };
}
