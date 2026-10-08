import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, type RefObject } from 'react';

import { MAPBOX_TOKEN } from '@/services/mapboxConfig';

import {
  getMapTheme,
  lightPresetAt,
  mapAppearance,
  useClockLightPreset,
  useMapTheme,
  type MapAppearance,
} from './mapTheme';

const BASEMAP = 'basemap';

/** Aparência pedida por último para cada mapa (aplicada assim que o estilo carregar). */
const wanted = new WeakMap<mapboxgl.Map, MapAppearance>();
/** Aparência passada junto com o estilo base atual (no construtor ou no setStyle). */
const styled = new WeakMap<mapboxgl.Map, MapAppearance>();

/**
 * Cria um mapa com a configuração padrão do Usafy: estilo Standard com as cores da marca e
 * o tema escolhido pelo usuário, sem rotação nem inclinação por gesto. Para o entregador,
 * giro acidental com o polegar só atrapalha.
 */
export function createMap(
  container: HTMLElement,
  options: Omit<mapboxgl.MapOptions, 'container'> = {},
): mapboxgl.Map {
  const appearance = mapAppearance(getMapTheme(), lightPresetAt(new Date()));
  const map = new mapboxgl.Map({
    container,
    accessToken: MAPBOX_TOKEN,
    style: appearance.style,
    config: { [BASEMAP]: appearance.config },
    pitchWithRotate: false,
    dragRotate: false,
    touchPitch: false,
    ...options,
  });
  map.touchZoomRotate.disableRotation();
  wanted.set(map, appearance);
  styled.set(map, appearance);

  // Uma troca de tema pedida enquanto o estilo ainda carregava é aplicada aqui.
  map.on('style.load', () => {
    const latest = wanted.get(map);
    if (latest && latest !== styled.get(map)) map.setConfig(BASEMAP, latest.config);
  });
  return map;
}

function applyAppearance(map: mapboxgl.Map, appearance: MapAppearance): void {
  wanted.set(map, appearance);

  if (styled.get(map)?.style !== appearance.style) {
    // Trocar de estilo (Standard ↔ Satélite) apaga as camadas próprias: quem desenha sobre
    // o mapa precisa recriá-las no evento `style.load`.
    styled.set(map, appearance);
    map.setStyle(appearance.style, {
      diff: false,
      config: { [BASEMAP]: appearance.config },
      localFontFamily: undefined,
      localIdeographFontFamily: undefined,
    });
  } else if (map.isStyleLoaded()) {
    map.setConfig(BASEMAP, appearance.config);
  }
}

/** Mantém o mapa em sincronia com o tema escolhido e com a iluminação do horário. */
export function useMapAppearance(mapRef: RefObject<mapboxgl.Map | null>, ready: boolean): void {
  const [theme] = useMapTheme();
  const clockPreset = useClockLightPreset();

  useEffect(() => {
    const map = mapRef.current;
    if (map && ready) applyAppearance(map, mapAppearance(theme, clockPreset));
  }, [mapRef, ready, theme, clockPreset]);
}

/**
 * Registra `onFatal` para quando o estilo base nem chega a carregar (token inválido,
 * offline). Depois da primeira carga, falhas de tiles e de trocas de tema são ignoradas.
 */
export function onMapFatalError(map: mapboxgl.Map, onFatal: () => void): void {
  let loadedOnce = false;
  map.once('style.load', () => {
    loadedOnce = true;
  });
  map.on('error', () => {
    if (!loadedOnce) onFatal();
  });
}
