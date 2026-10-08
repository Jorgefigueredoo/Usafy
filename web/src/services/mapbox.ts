import type { Coordinate } from '@/types';

import { MAPBOX_TOKEN, RECIFE_CENTER, RECIFE_METRO_BBOX } from './mapboxConfig';
import { RouteServiceError } from './routeServiceError';

const GEOCODING_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';
const DIRECTIONS_URL = 'https://api.mapbox.com/directions/v5/mapbox/driving';

export interface Place {
  /** Nome legível retornado pelo Mapbox (ex.: "Boa Viagem, Recife - Pernambuco"). */
  label: string;
  coordinate: Coordinate;
}

export interface DirectionsStep {
  name: string;
  distanceMeters: number;
  /** Texto da manobra no início do passo, já em pt-BR ("Vire à direita na Rua X"). */
  instruction: string;
  /** Tipo da manobra no Mapbox: `turn`, `depart`, `arrive`, `roundabout`... */
  maneuverType: string;
  /** Direção: `left`, `slight right`, `uturn`, `straight`... (vazio quando não se aplica). */
  maneuverModifier: string;
}

export interface Directions {
  geometry: Coordinate[];
  distanceMeters: number;
  durationSeconds: number;
  /** Passos na ordem do trajeto; usados para dar nome de rua aos trechos. */
  steps: DirectionsStep[];
}

// ---------------------------------------------------------------------------
// Validação das respostas: o JSON chega como `unknown` e só vira tipo após checagem.

type JsonObject = Record<string, unknown>;

const isObject = (value: unknown): value is JsonObject =>
  typeof value === 'object' && value !== null;

const isCoordinate = (value: unknown): value is Coordinate =>
  Array.isArray(value) &&
  value.length >= 2 &&
  typeof value[0] === 'number' &&
  typeof value[1] === 'number';

function parsePlace(body: unknown): Place | null {
  if (!isObject(body) || !Array.isArray(body.features)) return null;
  const feature: unknown = body.features[0];
  if (!isObject(feature) || !isCoordinate(feature.center)) return null;

  const label = typeof feature.place_name === 'string' ? feature.place_name : '';
  return { label, coordinate: [feature.center[0], feature.center[1]] };
}

function parseSteps(legs: unknown): DirectionsStep[] {
  if (!Array.isArray(legs)) return [];
  return legs.flatMap((leg: unknown) => {
    if (!isObject(leg) || !Array.isArray(leg.steps)) return [];
    return leg.steps.filter(isObject).map((step) => {
      const maneuver = isObject(step.maneuver) ? step.maneuver : {};
      return {
        name: typeof step.name === 'string' ? step.name : '',
        distanceMeters: typeof step.distance === 'number' ? step.distance : 0,
        instruction: typeof maneuver.instruction === 'string' ? maneuver.instruction : '',
        maneuverType: typeof maneuver.type === 'string' ? maneuver.type : '',
        maneuverModifier: typeof maneuver.modifier === 'string' ? maneuver.modifier : '',
      };
    });
  });
}

function parseRoute(route: unknown): Directions | null {
  if (!isObject(route) || !isObject(route.geometry)) return null;

  const { coordinates } = route.geometry;
  if (!Array.isArray(coordinates) || !coordinates.every(isCoordinate)) return null;
  if (typeof route.distance !== 'number' || typeof route.duration !== 'number') return null;

  return {
    geometry: coordinates.map(([lng, lat]) => [lng, lat]),
    distanceMeters: route.distance,
    durationSeconds: route.duration,
    steps: parseSteps(route.legs),
  };
}

/** Todas as rotas válidas da resposta, na ordem do Mapbox (a primeira é a recomendada). */
function parseDirections(body: unknown): Directions[] {
  if (!isObject(body) || !Array.isArray(body.routes)) return [];
  return body.routes
    .map(parseRoute)
    .filter((route): route is Directions => route !== null && route.geometry.length >= 2);
}

// ---------------------------------------------------------------------------

function requireToken(): string {
  if (!MAPBOX_TOKEN) {
    throw new RouteServiceError(
      'O mapa ainda não está configurado. Defina VITE_MAPBOX_TOKEN no arquivo .env.',
    );
  }
  return MAPBOX_TOKEN;
}

async function fetchJson(url: string, signal?: AbortSignal): Promise<{ status: number; body: unknown }> {
  let response: Response;
  try {
    response = await fetch(url, { signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new RouteServiceError('Sem conexão com a internet. Verifique sua rede e tente de novo.');
  }

  if (response.status === 401 || response.status === 403) {
    throw new RouteServiceError('Token do Mapbox inválido ou sem permissão. Confira o arquivo .env.');
  }
  if (response.status === 429) {
    throw new RouteServiceError('Muitas buscas em pouco tempo. Aguarde alguns segundos e tente de novo.');
  }

  const body: unknown = await response.json().catch(() => null);
  return { status: response.status, body };
}

/** Converte um texto livre (bairro, rua, ponto de referência) em coordenada na RMR. */
export async function geocode(query: string, signal?: AbortSignal): Promise<Place> {
  const params = new URLSearchParams({
    access_token: requireToken(),
    proximity: RECIFE_CENTER.join(','),
    bbox: RECIFE_METRO_BBOX.join(','),
    country: 'br',
    language: 'pt',
    limit: '1',
  });
  const url = `${GEOCODING_URL}/${encodeURIComponent(query)}.json?${params.toString()}`;

  const { status, body } = await fetchJson(url, signal);
  const place = status === 200 ? parsePlace(body) : null;

  if (!place) {
    throw new RouteServiceError(
      `Não encontramos "${query}" no Recife. Tente o nome do bairro ou um endereço mais completo.`,
    );
  }
  return place;
}

/**
 * Caminhos de `from` até `to`. Com `alternatives`, o Mapbox devolve até 3 opções (às vezes
 * só 1, quando não há caminho razoavelmente diferente).
 */
export async function getDirections(
  from: Coordinate,
  to: Coordinate,
  { alternatives = false, signal }: { alternatives?: boolean; signal?: AbortSignal } = {},
): Promise<Directions[]> {
  const params = new URLSearchParams({
    access_token: requireToken(),
    geometries: 'geojson',
    // `full` mantém todos os vértices: com o padrão (simplified) as cores dos
    // trechos cortariam esquinas no mapa.
    overview: 'full',
    steps: 'true',
    language: 'pt-BR',
    alternatives: String(alternatives),
  });
  const url = `${DIRECTIONS_URL}/${from.join(',')};${to.join(',')}?${params.toString()}`;

  const { body } = await fetchJson(url, signal);
  const directions = parseDirections(body);

  if (directions.length === 0) {
    throw new RouteServiceError(
      'Não encontramos um caminho de moto entre esses dois pontos. Tente outro endereço.',
    );
  }
  return directions;
}
