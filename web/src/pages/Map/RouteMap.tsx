import type { Feature, FeatureCollection, LineString } from 'geojson';
import mapboxgl, { type GeoJSONSource } from 'mapbox-gl';
import { useEffect, useRef, useState } from 'react';

import { animateMarker, createMap, createMarker, MapFallback, onMapFatalError } from '@/components/map';
import { MAPBOX_TOKEN } from '@/services/mapboxConfig';
import { colors, riskFillColors, spacing } from '@/theme';
import type { Coordinate, RiskLevel, Route } from '@/types';

import styles from './RouteMap.module.css';

/** O que o mapa precisa saber do modo navegação (calculado em useNavigation). */
export interface RouteNavigationView {
  position: Coordinate;
  bearing: number;
  following: boolean;
  traveled: Coordinate[];
}

export interface RouteMapProps {
  route: Route;
  /** Posição atual do usuário fora do modo navegação (ponto azul). */
  userLocation?: Coordinate | null;
  /** Presente durante a navegação: a câmera passa a seguir o usuário. */
  navigation?: RouteNavigationView | null;
  /** Usuário arrastou ou deu zoom no mapa (para pausar o "seguir"). */
  onUserGesture?: () => void;
}

const ROUTE_SOURCE = 'route-segments';
const TRAVELED_SOURCE = 'route-traveled';
const LINE_WIDTH = 6;
const CASING_WIDTH = LINE_WIDTH + spacing.xs;

/** Folga ao enquadrar a rota: em cima fica o header flutuante, embaixo o painel. */
const FIT_PADDING = {
  top: spacing.xxl + spacing.xl,
  bottom: spacing.xl + spacing.lg,
  left: spacing.xl,
  right: spacing.xl,
};
const NO_PADDING = { top: 0, bottom: 0, left: 0, right: 0 };

/** Câmera de navegação: perto, inclinada e com o usuário no terço de baixo da tela. */
const FOLLOW_ZOOM = 17;
const FOLLOW_PITCH = 55;
const FOLLOW_TOP_PADDING_RATIO = 0.45;
/** Duração da transição entre leituras do GPS (~1 por segundo). */
const FOLLOW_DURATION_MS = 900;
const linear = (t: number) => t;

function boundsOf(line: Coordinate[]): mapboxgl.LngLatBounds {
  return line.reduce(
    (bounds, point) => bounds.extend(point),
    new mapboxgl.LngLatBounds(line[0], line[0]),
  );
}

function segmentsAsGeoJson(route: Route): FeatureCollection<LineString, { riskLevel: RiskLevel }> {
  return {
    type: 'FeatureCollection',
    features: route.segments.map((segment) => ({
      type: 'Feature',
      properties: { riskLevel: segment.riskLevel },
      geometry: { type: 'LineString', coordinates: segment.coordinates },
    })),
  };
}

function lineFeature(coordinates: Coordinate[]): Feature<LineString> {
  return { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates } };
}

function addRouteLayers(map: mapboxgl.Map, route: Route): void {
  map.addSource(ROUTE_SOURCE, { type: 'geojson', data: segmentsAsGeoJson(route) });
  map.addSource(TRAVELED_SOURCE, { type: 'geojson', data: lineFeature([]) });

  const lineLayout = { 'line-cap': 'round', 'line-join': 'round' } as const;

  map.addLayer({
    id: 'route-casing',
    type: 'line',
    source: ROUTE_SOURCE,
    layout: lineLayout,
    paint: { 'line-color': colors.background, 'line-width': CASING_WIDTH },
  });

  map.addLayer({
    id: 'route-risk',
    type: 'line',
    source: ROUTE_SOURCE,
    layout: lineLayout,
    paint: {
      'line-width': LINE_WIDTH,
      'line-color': [
        'match',
        ['get', 'riskLevel'],
        'low',
        riskFillColors.low,
        'medium',
        riskFillColors.medium,
        'high',
        riskFillColors.high,
        colors.primary,
      ],
    },
  });

  // Por cima da rota: o que já foi percorrido fica apagado, como no Google Maps.
  map.addLayer({
    id: 'route-traveled',
    type: 'line',
    source: TRAVELED_SOURCE,
    layout: lineLayout,
    paint: { 'line-color': colors.textSecondary, 'line-width': LINE_WIDTH, 'line-opacity': 0.55 },
  });
}

function setLineData(map: mapboxgl.Map, sourceId: string, data: Feature | FeatureCollection): void {
  map.getSource<GeoJSONSource>(sourceId)?.setData(data);
}

export function RouteMap({ route, userLocation = null, navigation = null, onUserGesture }: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const originMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const destinationMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const navigatorMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const cancelAnimationRef = useRef<(() => void) | null>(null);
  const onUserGestureRef = useRef(onUserGesture);

  // A rota inicial só serve para montar o mapa; trocas de rota (recálculo) atualizam os dados.
  const [initialRoute] = useState(route);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const navigating = navigation !== null;

  useEffect(() => {
    onUserGestureRef.current = onUserGesture;
  }, [onUserGesture]);

  useEffect(() => {
    const container = containerRef.current;
    const start = initialRoute.geometry[0];
    const end = initialRoute.geometry[initialRoute.geometry.length - 1];
    if (!container || !MAPBOX_TOKEN || !start || !end) return;

    const map = createMap(container, {
      bounds: boundsOf(initialRoute.geometry),
      fitBoundsOptions: { padding: FIT_PADDING },
    });
    mapRef.current = map;
    onMapFatalError(map, () => setFailed(true));
    map.on('load', () => {
      addRouteLayers(map, initialRoute);
      setReady(true);
    });

    // Só gestos do usuário pausam o "seguir" — os movimentos que a própria câmera faz não.
    const notifyGesture = () => onUserGestureRef.current?.();
    map.on('dragstart', notifyGesture);
    map.on('wheel', notifyGesture);
    map.on('touchstart', (event) => {
      if (event.originalEvent.touches.length > 1) notifyGesture();
    });

    originMarkerRef.current = createMarker('origin', `Origem: ${initialRoute.origin}`)
      .setLngLat(start)
      .addTo(map);
    destinationMarkerRef.current = createMarker('destination', `Destino: ${initialRoute.destination}`)
      .setLngLat(end)
      .addTo(map);

    // map.remove() também remove os marcadores presos a ele.
    return () => {
      cancelAnimationRef.current?.();
      map.remove();
      setReady(false);
      mapRef.current = null;
      originMarkerRef.current = null;
      destinationMarkerRef.current = null;
      userMarkerRef.current = null;
      navigatorMarkerRef.current = null;
    };
  }, [initialRoute]);

  // Rota trocada (recálculo durante a navegação): atualiza linha e marcadores no lugar.
  useEffect(() => {
    const map = mapRef.current;
    const start = route.geometry[0];
    const end = route.geometry[route.geometry.length - 1];
    if (!map || !ready || !start || !end) return;

    setLineData(map, ROUTE_SOURCE, segmentsAsGeoJson(route));
    originMarkerRef.current?.setLngLat(start);
    destinationMarkerRef.current?.setLngLat(end);
  }, [route, ready]);

  // Fora da navegação: visão geral da rota, com o mapa "deitado" e o norte para cima.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || navigating) return;

    map.resize();
    map.setPadding(NO_PADDING);
    map.fitBounds(boundsOf(route.geometry), { padding: FIT_PADDING, pitch: 0, bearing: 0, duration: 800 });
  }, [route, ready, navigating]);

  // Entrar/sair da navegação muda o tamanho do painel inferior. Os botões +/− só aparecem
  // na visão geral: durante a navegação, a câmera seguindo desfaria o zoom deles.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    map.resize();
    if (navigating) return;

    const zoomControl = new mapboxgl.NavigationControl({ showCompass: false });
    map.addControl(zoomControl, 'bottom-right');
    return () => {
      // Se o mapa já foi destruído, o controle saiu junto com ele.
      if (mapRef.current === map) map.removeControl(zoomControl);
    };
  }, [navigating, ready]);

  // Ponto azul (visão geral) ou seta de navegação, trecho percorrido e câmera seguindo.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    if (!navigation) {
      navigatorMarkerRef.current?.remove();
      navigatorMarkerRef.current = null;
      setLineData(map, TRAVELED_SOURCE, lineFeature([]));

      if (userLocation) {
        userMarkerRef.current ??= createMarker('user', 'Você está aqui').setLngLat(userLocation).addTo(map);
        userMarkerRef.current.setLngLat(userLocation);
      } else {
        userMarkerRef.current?.remove();
        userMarkerRef.current = null;
      }
      return;
    }

    userMarkerRef.current?.remove();
    userMarkerRef.current = null;

    if (!navigatorMarkerRef.current) {
      navigatorMarkerRef.current = createMarker('navigator', 'Você está aqui')
        .setLngLat(navigation.position)
        .addTo(map);
    } else {
      cancelAnimationRef.current?.();
      cancelAnimationRef.current = animateMarker(
        navigatorMarkerRef.current,
        navigation.position,
        FOLLOW_DURATION_MS,
      );
    }
    navigatorMarkerRef.current.setRotation(navigation.bearing);
    setLineData(map, TRAVELED_SOURCE, lineFeature(navigation.traveled));

    if (navigation.following) {
      map.easeTo({
        center: navigation.position,
        bearing: navigation.bearing,
        pitch: FOLLOW_PITCH,
        zoom: FOLLOW_ZOOM,
        padding: { ...NO_PADDING, top: map.getContainer().clientHeight * FOLLOW_TOP_PADDING_RATIO },
        duration: FOLLOW_DURATION_MS,
        easing: linear,
      });
    }
  }, [navigation, userLocation, ready]);

  if (!MAPBOX_TOKEN || failed) return <MapFallback />;

  return (
    <div
      ref={containerRef}
      className={styles.map}
      aria-label={`Mapa da rota de ${route.origin} até ${route.destination}`}
    />
  );
}
