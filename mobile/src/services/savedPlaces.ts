import type { Coordinate } from '@/types';

/**
 * Lugares do usuário guardados no aparelho: Casa, Trabalho e os destinos buscados por último.
 * Sem backend por enquanto; quando houver conta de usuário, isto pode ir para o servidor.
 */

export interface SavedPlace {
  /** Texto exibido e, sem coordenada, enviado ao geocoding. */
  text: string;
  coordinate: Coordinate | null;
}

export type FavoriteKind = 'home' | 'work';

export interface SavedPlaces {
  favorites: Partial<Record<FavoriteKind, SavedPlace>>;
  /** Destinos mais recentes primeiro. */
  recents: SavedPlace[];
}

const STORAGE_KEY = 'usafy:saved-places';
const MAX_RECENTS = 5;
const EMPTY: SavedPlaces = { favorites: {}, recents: [] };

// ---------------------------------------------------------------------------
// Leitura defensiva: o que vem do storage é `unknown` até provar o contrário.

type JsonObject = Record<string, unknown>;

const isObject = (value: unknown): value is JsonObject => typeof value === 'object' && value !== null;

const isCoordinate = (value: unknown): value is Coordinate =>
  Array.isArray(value) &&
  value.length === 2 &&
  typeof value[0] === 'number' &&
  typeof value[1] === 'number';

function parsePlace(value: unknown): SavedPlace | null {
  if (!isObject(value) || typeof value.text !== 'string' || !value.text.trim()) return null;
  return { text: value.text, coordinate: isCoordinate(value.coordinate) ? value.coordinate : null };
}

function parseSavedPlaces(value: unknown): SavedPlaces {
  if (!isObject(value)) return EMPTY;
  const favorites: SavedPlaces['favorites'] = {};
  if (isObject(value.favorites)) {
    const home = parsePlace(value.favorites.home);
    const work = parsePlace(value.favorites.work);
    if (home) favorites.home = home;
    if (work) favorites.work = work;
  }
  const recents = Array.isArray(value.recents)
    ? value.recents.map(parsePlace).filter((place): place is SavedPlace => place !== null)
    : [];
  return { favorites, recents: recents.slice(0, MAX_RECENTS) };
}

function read(): SavedPlaces {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? parseSavedPlaces(JSON.parse(raw)) : EMPTY;
  } catch {
    return EMPTY;
  }
}

// ---------------------------------------------------------------------------
// Estado compartilhado entre componentes (useSyncExternalStore em hooks/useSavedPlaces).

let current = read();
const listeners = new Set<() => void>();

function write(next: SavedPlaces): void {
  current = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Sem armazenamento os lugares valem só até fechar o app.
  }
  listeners.forEach((listener) => listener());
}

export function getSavedPlaces(): SavedPlaces {
  return current;
}

export function subscribeSavedPlaces(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const sameText = (a: string, b: string) =>
  a.trim().toLocaleLowerCase('pt-BR') === b.trim().toLocaleLowerCase('pt-BR');

export function setFavorite(kind: FavoriteKind, place: SavedPlace | null): void {
  const favorites = { ...current.favorites };
  if (place) favorites[kind] = place;
  else delete favorites[kind];
  write({ ...current, favorites });
}

/** Guarda um destino buscado no topo dos recentes (sem repetir o mesmo lugar). */
export function addRecent(place: SavedPlace): void {
  if (!place.text.trim()) return;
  const others = current.recents.filter((recent) => !sameText(recent.text, place.text));
  write({ ...current, recents: [place, ...others].slice(0, MAX_RECENTS) });
}

export function clearRecents(): void {
  write({ ...current, recents: [] });
}
