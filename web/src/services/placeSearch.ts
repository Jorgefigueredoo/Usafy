import type { Coordinate } from '@/types';

import {
  isInsideRecifeMetro,
  MAPBOX_TOKEN,
  RECIFE_CENTER,
  RECIFE_METRO_BBOX,
} from './mapboxConfig';

/**
 * Autocompletar de lugares com a Mapbox Search Box API. Ela acha estabelecimentos
 * ("Shopping Recife", "RioMar") que a Geocoding v5 não conhece.
 *
 * Funciona em duas etapas: `suggest` lista nomes enquanto o usuário digita (sem
 * coordenadas) e `retrieve` busca a coordenada do item escolhido. As duas usam o mesmo
 * `sessionToken`; o Mapbox cobra a sessão inteira como uma busca só.
 */

const SEARCH_URL = 'https://api.mapbox.com/search/searchbox/v1';
/** Sem "category": sugestões do tipo "Shopping (categoria)" não levam a um lugar concreto. */
const SUGGESTION_TYPES = 'poi,address,street,neighborhood,locality,place';
const SUGGESTION_LIMIT = 6;

export type PlaceKind = 'poi' | 'address' | 'area';

export interface PlaceSuggestion {
  id: string;
  name: string;
  /** Endereço ou região, para diferenciar lugares com o mesmo nome. */
  description: string;
  kind: PlaceKind;
}

export interface ResolvedPlace {
  label: string;
  coordinate: Coordinate;
}

type JsonObject = Record<string, unknown>;

const isObject = (value: unknown): value is JsonObject =>
  typeof value === 'object' && value !== null;

const text = (value: unknown): string => (typeof value === 'string' ? value : '');

function kindOf(featureType: string): PlaceKind {
  if (featureType === 'poi') return 'poi';
  if (featureType === 'address' || featureType === 'street') return 'address';
  return 'area';
}

function parseSuggestions(body: unknown): PlaceSuggestion[] {
  if (!isObject(body) || !Array.isArray(body.suggestions)) return [];
  return body.suggestions.filter(isObject).flatMap((item) => {
    const id = text(item.mapbox_id);
    const name = text(item.name);
    if (!id || !name) return [];
    return [
      {
        id,
        name,
        description: text(item.full_address) || text(item.place_formatted),
        kind: kindOf(text(item.feature_type)),
      },
    ];
  });
}

function toCoordinate(longitude: unknown, latitude: unknown): Coordinate | null {
  return typeof longitude === 'number' && typeof latitude === 'number' ? [longitude, latitude] : null;
}

/**
 * Prefere o "ponto roteável" (a entrada do lugar na rua) ao centro do prédio: num
 * shopping, o centro pode ficar a centenas de metros da via mais próxima.
 */
function parseRetrievedCoordinate(body: unknown): Coordinate | null {
  if (!isObject(body) || !Array.isArray(body.features)) return null;
  const feature: unknown = body.features[0];
  if (!isObject(feature)) return null;

  const properties = isObject(feature.properties) ? feature.properties : {};
  const coordinates = isObject(properties.coordinates) ? properties.coordinates : {};
  const routable = Array.isArray(coordinates.routable_points) ? coordinates.routable_points[0] : null;
  if (isObject(routable)) {
    const entrance = toCoordinate(routable.longitude, routable.latitude);
    if (entrance) return entrance;
  }

  const geometry = isObject(feature.geometry) ? feature.geometry : {};
  const point = Array.isArray(geometry.coordinates) ? geometry.coordinates : [];
  return toCoordinate(point[0], point[1]);
}

export function createSearchSession(): string {
  return crypto.randomUUID();
}

export async function suggestPlaces(
  query: string,
  sessionToken: string,
  near: Coordinate | null,
  signal?: AbortSignal,
): Promise<PlaceSuggestion[]> {
  if (!MAPBOX_TOKEN) return [];

  // Perto do usuário quando ele está no Recife: "shopping" traz primeiro o do bairro dele.
  const proximity = near && isInsideRecifeMetro(near) ? near : RECIFE_CENTER;
  const params = new URLSearchParams({
    q: query,
    access_token: MAPBOX_TOKEN,
    session_token: sessionToken,
    proximity: proximity.join(','),
    bbox: RECIFE_METRO_BBOX.join(','),
    country: 'br',
    language: 'pt',
    limit: String(SUGGESTION_LIMIT),
    types: SUGGESTION_TYPES,
  });

  const response = await fetch(`${SEARCH_URL}/suggest?${params.toString()}`, { signal });
  if (!response.ok) return [];
  const body: unknown = await response.json().catch(() => null);
  return parseSuggestions(body);
}

/** Coordenada do lugar escolhido. `null` se o Mapbox não souber (aí usamos o texto). */
export async function retrievePlace(
  suggestion: PlaceSuggestion,
  sessionToken: string,
  signal?: AbortSignal,
): Promise<ResolvedPlace | null> {
  if (!MAPBOX_TOKEN) return null;

  const params = new URLSearchParams({ access_token: MAPBOX_TOKEN, session_token: sessionToken });
  const url = `${SEARCH_URL}/retrieve/${encodeURIComponent(suggestion.id)}?${params.toString()}`;
  const response = await fetch(url, { signal });
  if (!response.ok) return null;

  const body: unknown = await response.json().catch(() => null);
  const coordinate = parseRetrievedCoordinate(body);
  return coordinate ? { label: suggestion.name, coordinate } : null;
}
