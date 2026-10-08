import type { Coordinate, Maneuver, ManeuverDirection, Route, RouteSegment } from '@/types';
import { riskLevelFromScore } from '@/utils/risk';
import { splitLineByDistance } from '@/utils/geo';

import { geocode, getDirections, type Directions, type DirectionsStep } from './mapbox';
import { isInsideRecifeMetro } from './mapboxConfig';
import { createSeededRandom, mockSegmentRisk } from './riskMock';
import { RouteServiceError } from './routeServiceError';

export { RouteServiceError };

/** Ponto de partida/chegada: texto livre (vai para o geocoding) ou coordenada já conhecida (GPS). */
export type RouteEndpoint = string | { label: string; coordinate: Coordinate };

interface ResolvedEndpoint {
  label: string;
  coordinate: Coordinate;
}

async function resolveEndpoint(endpoint: RouteEndpoint, signal?: AbortSignal): Promise<ResolvedEndpoint> {
  if (typeof endpoint !== 'string') {
    if (!isInsideRecifeMetro(endpoint.coordinate)) {
      throw new RouteServiceError(
        'Sua localização está fora da Região Metropolitana do Recife, onde o Usafy funciona por enquanto. Digite um endereço de origem.',
      );
    }
    return endpoint;
  }

  const query = endpoint.trim();
  if (!query) throw new RouteServiceError('Informe origem e destino para calcular a rota.');

  const place = await geocode(query, signal);
  // Mantém o texto que o usuário digitou como rótulo: é mais curto e reconhecível que o place_name.
  return { label: query, coordinate: place.coordinate };
}

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

async function fetchDirections(
  origin: RouteEndpoint,
  destination: RouteEndpoint,
  alternatives: boolean,
  signal?: AbortSignal,
): Promise<{ from: ResolvedEndpoint; to: ResolvedEndpoint; options: Directions[] }> {
  const [from, to] = await Promise.all([
    resolveEndpoint(origin, signal),
    resolveEndpoint(destination, signal),
  ]);

  const options = await getDirections(from.coordinate, to.coordinate, { alternatives, signal });

  if (options.every((directions) => directions.distanceMeters < 1)) {
    throw new RouteServiceError('Origem e destino apontam para o mesmo lugar. Revise os endereços.');
  }
  return { from, to, options };
}

/** `variant` diferencia o risco simulado de cada alternativa (0 = rota principal). */
function buildRoute(
  from: ResolvedEndpoint,
  to: ResolvedEndpoint,
  directions: Directions,
  variant: number,
): Route {
  const segmentCount = segmentCountFor(directions.distanceMeters);
  const pieces = splitLineByDistance(directions.geometry, segmentCount);
  const segmentDistance = directions.distanceMeters / pieces.length;
  // Semente pelas coordenadas (~100 m de precisão), não pelo texto: "Minha localização"
  // em lugares diferentes precisa gerar riscos diferentes.
  const seed = [from.coordinate, to.coordinate]
    .map((point) => point.map((n) => n.toFixed(3)).join(','))
    .join('|');
  const random = createSeededRandom(variant === 0 ? seed : `${seed}#${variant}`);

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
    origin: from.label,
    destination: to.label,
    overallRisk: riskLevelFromScore(overallScore),
    overallScore,
    durationMinutes: directions.durationSeconds / 60,
    distanceKm: directions.distanceMeters / 1000,
    geometry: directions.geometry,
    segments,
    maneuvers: buildManeuvers(directions.steps),
  };
}

/** Uma única rota (a recomendada pelo Mapbox). Usada no recálculo durante a navegação. */
export async function getRoute(
  origin: RouteEndpoint,
  destination: RouteEndpoint,
  signal?: AbortSignal,
): Promise<Route> {
  const { from, to, options } = await fetchDirections(origin, destination, false, signal);
  const [main] = options;
  if (!main) throw new RouteServiceError('Não foi possível calcular a rota agora.');
  return buildRoute(from, to, main, 0);
}

/** Todas as opções de caminho (1 a 3), cada uma com o próprio risco, para o usuário comparar. */
export async function getRouteOptions(
  origin: RouteEndpoint,
  destination: RouteEndpoint,
  signal?: AbortSignal,
): Promise<Route[]> {
  const { from, to, options } = await fetchDirections(origin, destination, true, signal);
  return options.map((directions, index) => buildRoute(from, to, directions, index));
}

function directionOf(type: string, modifier: string): ManeuverDirection {
  if (type === 'arrive') return 'arrive';
  if (modifier.includes('uturn')) return 'uturn';
  if (modifier.includes('left')) return 'left';
  if (modifier.includes('right')) return 'right';
  return 'straight';
}

/** Cada passo do Directions começa com uma manobra; a posição dela é a soma dos passos anteriores. */
function buildManeuvers(steps: DirectionsStep[]): Maneuver[] {
  const maneuvers: Maneuver[] = [];
  let distanceFromStart = 0;

  for (const step of steps) {
    // A partida ("Siga para o norte") já ficou para trás quando a navegação começa.
    if (step.maneuverType !== 'depart' && step.instruction) {
      maneuvers.push({
        instruction: step.instruction,
        direction: directionOf(step.maneuverType, step.maneuverModifier),
        distanceFromStartMeters: distanceFromStart,
      });
    }
    distanceFromStart += step.distanceMeters;
  }
  return maneuvers;
}
