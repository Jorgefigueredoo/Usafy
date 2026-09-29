import type { Route } from '@/types';
import { buildMockRoute } from './mocks/routeMocks';

/**
 * Fronteira entre UI e dados. As assinaturas aqui já são as definitivas: quando o
 * backend Spring Boot subir, só o corpo destas funções muda (fetch em vez de mock)
 * e nenhuma tela precisa ser tocada.
 */

/** Latência simulada para que os estados de loading sejam reais em desenvolvimento. */
const MOCK_LATENCY_MS = 900;

export class RouteServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RouteServiceError';
  }
}

export async function getRoute(origin: string, destination: string): Promise<Route> {
  const trimmedOrigin = origin.trim();
  const trimmedDestination = destination.trim();

  if (trimmedOrigin.length === 0 || trimmedDestination.length === 0) {
    throw new RouteServiceError('Informe origem e destino para calcular a rota.');
  }

  // TODO(api): substituir por POST /routes no backend, mantendo este contrato.
  await delay(MOCK_LATENCY_MS);

  return buildMockRoute(trimmedOrigin, trimmedDestination);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
