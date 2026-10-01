import { createContext } from 'react';

import type { Coordinate } from '@/types';

/**
 * - `idle`: ainda não pedimos a localização (permissão não concedida antes).
 * - `locating`: aguardando a primeira leitura do GPS.
 * - `active`: temos posição e ela continua sendo atualizada.
 * - `error`: negado, indisponível ou navegador sem suporte (veja `error`).
 */
export type LocationStatus = 'idle' | 'locating' | 'active' | 'error';

export interface UserLocationValue {
  status: LocationStatus;
  coordinate: Coordinate | null;
  /** Mensagem pronta para exibir quando `status === 'error'`. */
  error: string | null;
  /** Pede permissão (se preciso) e começa a acompanhar a posição. */
  request: () => void;
}

export const LocationContext = createContext<UserLocationValue | null>(null);
