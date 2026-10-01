import { createContext } from 'react';

import type { Coordinate } from '@/types';

/**
 * - `idle`: ainda não pedimos a localização (permissão não concedida antes).
 * - `locating`: aguardando a primeira leitura do GPS.
 * - `active`: temos posição e ela continua sendo atualizada.
 * - `error`: negado, indisponível ou navegador sem suporte (veja `error`).
 */
export type LocationStatus = 'idle' | 'locating' | 'active' | 'error';

/** Uma leitura do GPS. */
export interface UserPosition {
  coordinate: Coordinate;
  /** Direção do movimento em graus (0 = norte). `null` parado ou sem suporte do aparelho. */
  heading: number | null;
  /** Velocidade em m/s, quando o aparelho informa. */
  speed: number | null;
  /** Raio de incerteza da leitura, em metros. */
  accuracy: number;
  /** Momento da leitura (ms desde epoch), vindo do próprio GPS. */
  timestamp: number;
}

export interface UserLocationValue {
  status: LocationStatus;
  /** Atalho para `position.coordinate`. */
  coordinate: Coordinate | null;
  position: UserPosition | null;
  /** Mensagem pronta para exibir quando `status === 'error'`. */
  error: string | null;
  /** Pede permissão (se preciso) e começa a acompanhar a posição. */
  request: () => void;
}

export const LocationContext = createContext<UserLocationValue | null>(null);
