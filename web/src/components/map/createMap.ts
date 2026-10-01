import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

import { MAP_STYLE, MAPBOX_TOKEN } from '@/services/mapboxConfig';

/**
 * Cria um mapa com a configuração padrão do Usafy: estilo escuro e sem rotação nem
 * inclinação. Para o entregador, giro acidental com o polegar só atrapalha.
 */
export function createMap(
  container: HTMLElement,
  options: Omit<mapboxgl.MapOptions, 'container'> = {},
): mapboxgl.Map {
  const map = new mapboxgl.Map({
    container,
    accessToken: MAPBOX_TOKEN,
    style: MAP_STYLE,
    pitchWithRotate: false,
    dragRotate: false,
    touchPitch: false,
    ...options,
  });
  map.touchZoomRotate.disableRotation();
  return map;
}

/**
 * Registra `onFatal` para quando o estilo base nem chega a carregar (token inválido,
 * offline). Falhas de tiles isolados depois do carregamento são ignoradas.
 */
export function onMapFatalError(map: mapboxgl.Map, onFatal: () => void): void {
  map.on('error', () => {
    if (!map.isStyleLoaded()) onFatal();
  });
}
