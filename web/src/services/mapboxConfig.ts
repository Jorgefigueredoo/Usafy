import type { Coordinate } from '@/types';

export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN?.trim() ?? '';

export const MAP_STYLE = 'mapbox://styles/mapbox/dark-v11';

/** Marco Zero do Recife: viés de proximidade da busca e centro padrão do mapa. */
export const RECIFE_CENTER: Coordinate = [-34.877, -8.0476];

/**
 * Caixa [oeste, sul, leste, norte] cobrindo a Região Metropolitana (Olinda,
 * Jaboatão, Camaragibe) — entregas cruzam o limite do município o tempo todo.
 */
export const RECIFE_METRO_BBOX = [-35.1, -8.3, -34.8, -7.85] as const;
