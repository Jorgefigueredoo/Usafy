import type { FeatureCollection, LineString } from 'geojson';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useRef, useState } from 'react';

import { Icon, Text } from '@/components/ui';
import { MAP_STYLE, MAPBOX_TOKEN } from '@/services/mapboxConfig';
import { colors, layout, riskFillColors, spacing } from '@/theme';
import type { Coordinate, RiskLevel, Route } from '@/types';

import styles from './RouteMap.module.css';

export interface RouteMapProps {
  route: Route;
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

function markerElement(className: string | undefined, label: string): HTMLElement {
  const element = document.createElement('div');
  element.className = className ?? '';
  element.setAttribute('role', 'img');
  element.setAttribute('aria-label', label);
  return element;
}

export function RouteMap({ route }: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const start = route.geometry[0];
    const end = route.geometry[route.geometry.length - 1];
    if (!container || !MAPBOX_TOKEN || !start || !end) return;

    const map = new mapboxgl.Map({
      container,
      accessToken: MAPBOX_TOKEN,
      style: MAP_STYLE,
      bounds: boundsOf(route.geometry),
      fitBoundsOptions: { padding: FIT_PADDING },
      // Rota de entrega não precisa de inclinação/rotação; evita giros acidentais com o polegar.
      pitchWithRotate: false,
      dragRotate: false,
      touchPitch: false,
    });
    map.touchZoomRotate.disableRotation();
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');

    map.on('error', () => {
      // Só tratamos como falha fatal se o estilo base nem chegou a carregar (token inválido, offline).
      if (!map.isStyleLoaded()) setFailed(true);
    });

    map.on('load', () => {
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
    });

    const markers = [
      new mapboxgl.Marker({ element: markerElement(styles.originMarker, `Origem: ${route.origin}`) })
        .setLngLat(start)
        .addTo(map),
      new mapboxgl.Marker({
        element: markerElement(styles.destinationMarker, `Destino: ${route.destination}`),
      })
        .setLngLat(end)
        .addTo(map),
    ];

    return () => {
      markers.forEach((marker) => marker.remove());
      map.remove();
    };
  }, [route]);

  if (!MAPBOX_TOKEN || failed) {
    return (
      <div className={styles.fallback} role="status">
        <Icon name="alert" size={layout.iconLg} />
        <Text variant="subtitle" align="center">
          Não foi possível carregar o mapa
        </Text>
        <Text tone="secondary" align="center">
          {MAPBOX_TOKEN
            ? 'Verifique sua conexão e o token do Mapbox.'
            : 'Defina VITE_MAPBOX_TOKEN no arquivo .env e reinicie o servidor.'}
        </Text>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={styles.map}
      aria-label={`Mapa da rota de ${route.origin} até ${route.destination}`}
    />
  );
}
