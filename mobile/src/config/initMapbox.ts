import Mapbox from '@rnmapbox/maps';

import { MAPBOX_TOKEN } from './mapbox';

/** Chama uma vez na inicialização do app, antes de qualquer MapView ser montado. */
export function initMapbox(): void {
  if (!MAPBOX_TOKEN) {
    console.warn('EXPO_PUBLIC_MAPBOX_TOKEN não definido: o mapa não vai carregar. Veja .env.example.');
    return;
  }

  Mapbox.setAccessToken(MAPBOX_TOKEN);
}
