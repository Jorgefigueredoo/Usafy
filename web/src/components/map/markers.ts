import mapboxgl from 'mapbox-gl';

import type { Coordinate } from '@/types';

import styles from './markers.module.css';

export type MarkerKind = 'origin' | 'destination' | 'user' | 'navigator';

export function createMarker(kind: MarkerKind, label: string): mapboxgl.Marker {
  const element = document.createElement('div');
  element.className = styles[kind] ?? '';
  element.setAttribute('role', 'img');
  element.setAttribute('aria-label', label);

  // A seta de navegação gira e inclina junto com o mapa (fica "deitada" na rua em 3D).
  const alignment = kind === 'navigator' ? 'map' : 'auto';
  return new mapboxgl.Marker({ element, rotationAlignment: alignment, pitchAlignment: alignment });
}

/**
 * Desliza o marcador até `to` em `durationMs` (interpolação linear), no mesmo ritmo do
 * `easeTo` linear da câmera — assim seta e mapa andam juntos entre leituras do GPS.
 * Devolve uma função que cancela a animação.
 */
export function animateMarker(marker: mapboxgl.Marker, to: Coordinate, durationMs: number): () => void {
  const from = marker.getLngLat();
  const startedAt = performance.now();
  let frame = 0;

  const step = (now: number) => {
    const t = Math.min(1, (now - startedAt) / durationMs);
    marker.setLngLat([from.lng + (to[0] - from.lng) * t, from.lat + (to[1] - from.lat) * t]);
    if (t < 1) frame = requestAnimationFrame(step);
  };
  frame = requestAnimationFrame(step);

  return () => cancelAnimationFrame(frame);
}
