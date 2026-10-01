import type { FeatureCollection, LineString } from 'geojson';
import mapboxgl from 'mapbox-gl';
import { useEffect, useRef, useState } from 'react';

import { createMap, createMarker, MapFallback, onMapFatalError } from '@/components/map';
import { MAPBOX_TOKEN } from '@/services/mapboxConfig';
import { colors, riskFillColors, spacing } from '@/theme';
import type { Coordinate, RiskLevel, Route } from '@/types';

import styles from './RouteMap.module.css';

export interface RouteMapProps {
  route: Route;
  /** Posição atual do usuário; atualiza o ponto azul sem redesenhar a rota. */
  userLocation?: Coordinate | null;
}

const SOURCE_ID = 'route-segments';
const LINE_WIDTH = 6;
const CASING_WIDTH = LINE_WIDTH + spacing.xs;

/** Folga ao enquadrar a rota: em cima fica o header flutuante, embaixo o painel. */
const FIT_PADDING = {
  top: spacing.xxl + spacing.xl,
  bottom: spacing.xl + spacing.lg,
  left: spacing.xl,
  right: spacing.xl,
};

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

function addRouteLayers(map: mapboxgl.Map, route: Route): void {
  map.addSource(SOURCE_ID, { type: 'geojson', data: segmentsAsGeoJson(route) });

  map.addLayer({
    id: 'route-casing',
    type: 'line',
    source: SOURCE_ID,
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': colors.background, 'line-width': CASING_WIDTH },
  });

  map.addLayer({
    id: 'route-risk',
    type: 'line',
    source: SOURCE_ID,
    layout: { 'line-cap': 'round', 'line-join': 'round' },
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
}

export function RouteMap({ route, userLocation = null }: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const start = route.geometry[0];
    const end = route.geometry[route.geometry.length - 1];
    if (!container || !MAPBOX_TOKEN || !start || !end) return;

    const map = createMap(container, {
      bounds: boundsOf(route.geometry),
      fitBoundsOptions: { padding: FIT_PADDING },
    });
    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');
    onMapFatalError(map, () => setFailed(true));
    map.on('load', () => addRouteLayers(map, route));

    createMarker('origin', `Origem: ${route.origin}`).setLngLat(start).addTo(map);
    createMarker('destination', `Destino: ${route.destination}`).setLngLat(end).addTo(map);

    // map.remove() também remove os marcadores presos a ele.
    return () => {
      map.remove();
      mapRef.current = null;
      userMarkerRef.current = null;
    };
  }, [route]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!userLocation) {
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      return;
    }

    userMarkerRef.current ??= createMarker('user', 'Você está aqui').setLngLat(userLocation).addTo(map);
    userMarkerRef.current.setLngLat(userLocation);
  }, [userLocation, route]);

  if (!MAPBOX_TOKEN || failed) return <MapFallback />;

  return (
    <div
      ref={containerRef}
      className={styles.map}
      aria-label={`Mapa da rota de ${route.origin} até ${route.destination}`}
    />
  );
}
