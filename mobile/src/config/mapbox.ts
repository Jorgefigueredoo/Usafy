import Mapbox from '@rnmapbox/maps';

/** Centro do Recife: posição padrão do mapa quando não há rota para enquadrar. */
export const RECIFE_CENTER: [longitude: number, latitude: number] = [-34.877, -8.0476];

/** Chama uma vez na inicialização do app, antes de qualquer MapView ser montado. */
export function initMapbox(): void {
  const token = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;

  if (!token) {
    console.warn('EXPO_PUBLIC_MAPBOX_TOKEN não definido: o mapa não vai carregar. Veja .env.example.');
    return;
  }

  Mapbox.setAccessToken(token);
}
