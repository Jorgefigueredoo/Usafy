import type { Coordinate } from '@/types';

/** Texto do campo + coordenada, quando o usuário escolheu uma sugestão. */
export interface PlaceValue {
  text: string;
  coordinate: Coordinate | null;
}

export const EMPTY_PLACE: PlaceValue = { text: '', coordinate: null };
