export const paths = {
  onboarding: '/',
  home: '/home',
  map: '/map',
  routeDetails: '/route-details',
} as const;

/** Estado de navegação para abrir o mapa com um trecho da rota já em destaque. */
export interface MapNavigationState {
  segmentId: string;
}

/** Lê o `location.state` (chega como `unknown`) da tela do mapa. */
export function segmentIdFromState(state: unknown): string | null {
  if (typeof state !== 'object' || state === null || !('segmentId' in state)) return null;
  return typeof state.segmentId === 'string' ? state.segmentId : null;
}
