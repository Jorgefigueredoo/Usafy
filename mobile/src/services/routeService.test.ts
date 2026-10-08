import type { Coordinate } from '@/types';

import { getRoute, getRouteOptions, RouteServiceError } from './routeService';

/** Uma rota do Directions API com geometria em linha reta e um passo por trecho. */
function directionsRoute(geometry: Coordinate[], distance: number, duration: number) {
  return {
    distance,
    duration,
    geometry: { type: 'LineString', coordinates: geometry },
    legs: [
      {
        steps: [
          {
            name: 'Avenida Boa Viagem',
            distance: distance / 2,
            maneuver: { type: 'depart', modifier: '', instruction: 'Siga para o norte' },
          },
          {
            name: 'Avenida República Árabe Unida',
            distance: distance / 2,
            maneuver: { type: 'turn', modifier: 'right', instruction: 'Vire à direita' },
          },
        ],
      },
    ],
  };
}

const BOA_VIAGEM: Coordinate = [-34.8987, -8.1186];
const RIOMAR: Coordinate = [-34.896, -8.0857];

const ROUTES = [
  directionsRoute([BOA_VIAGEM, [-34.9, -8.1], RIOMAR], 6000, 720),
  directionsRoute([BOA_VIAGEM, [-34.89, -8.1], RIOMAR], 6300, 1020),
];

function jsonResponse(body: unknown, status = 200) {
  return Promise.resolve({ status, json: () => Promise.resolve(body) } as Response);
}

const fetchMock = jest.fn((url: string) => {
  if (url.includes('/geocoding/')) {
    const center = url.includes('RioMar') ? RIOMAR : BOA_VIAGEM;
    return jsonResponse({ features: [{ center, place_name: 'Recife' }] });
  }
  if (url.includes('/directions/')) {
    const alternatives = url.includes('alternatives=true');
    return jsonResponse({ routes: alternatives ? ROUTES : ROUTES.slice(0, 1) });
  }
  return jsonResponse({}, 404);
});

beforeEach(() => {
  fetchMock.mockClear();
  globalThis.fetch = fetchMock as unknown as typeof fetch;
});

describe('getRouteOptions', () => {
  it('transforma texto em coordenadas e devolve uma rota por alternativa', async () => {
    const routes = await getRouteOptions('Boa Viagem', 'RioMar');

    expect(routes).toHaveLength(2);
    const [first] = routes;
    expect(first?.origin).toBe('Boa Viagem');
    expect(first?.destination).toBe('RioMar');
    expect(first?.durationMinutes).toBe(12);
    expect(first?.distanceKm).toBe(6);
    // Contrato da API: traçado completo, trechos com risco e manobras sem a partida.
    expect(first?.geometry[0]).toEqual(BOA_VIAGEM);
    expect(first?.geometry.at(-1)).toEqual(RIOMAR);
    expect(first?.segments.length).toBeGreaterThanOrEqual(3);
    expect(first?.maneuvers).toEqual([
      { instruction: 'Vire à direita', direction: 'right', distanceFromStartMeters: 3000 },
    ]);
  });

  it('cada alternativa tem id próprio e risco simulado próprio', async () => {
    const [a, b] = await getRouteOptions('Boa Viagem', 'RioMar');
    expect(a?.id).not.toBe(b?.id);
    expect(a?.segments.map((s) => s.riskScore)).not.toEqual(b?.segments.map((s) => s.riskScore));
  });

  it('a mesma busca gera o mesmo risco (a rota não muda de cor ao refazer)', async () => {
    const first = await getRouteOptions('Boa Viagem', 'RioMar');
    const again = await getRouteOptions('Boa Viagem', 'RioMar');
    expect(again.map((route) => route.overallScore)).toEqual(first.map((route) => route.overallScore));
  });

  it('usa a coordenada do GPS sem chamar o geocoding', async () => {
    await getRouteOptions({ label: 'Minha localização', coordinate: BOA_VIAGEM }, { label: 'RioMar', coordinate: RIOMAR });
    expect(fetchMock.mock.calls.every(([url]) => !url.includes('/geocoding/'))).toBe(true);
  });

  it('recusa localização fora da Região Metropolitana do Recife', async () => {
    const saoPaulo: Coordinate = [-46.63, -23.55];
    await expect(
      getRouteOptions({ label: 'Minha localização', coordinate: saoPaulo }, 'RioMar'),
    ).rejects.toThrow(RouteServiceError);
  });

  it('pede origem e destino', async () => {
    await expect(getRouteOptions('  ', 'RioMar')).rejects.toThrow('Informe origem e destino');
  });
});

describe('getRoute', () => {
  it('devolve só a rota principal (usada no recálculo da navegação)', async () => {
    const route = await getRoute('Boa Viagem', 'RioMar');
    expect(route.durationMinutes).toBe(12);
    const directionsCall = fetchMock.mock.calls.find(([url]) => url.includes('/directions/'));
    expect(directionsCall?.[0]).toContain('alternatives=false');
  });
});
