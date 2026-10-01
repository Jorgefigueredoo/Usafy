import mapboxgl from 'mapbox-gl';

import styles from './markers.module.css';

export type MarkerKind = 'origin' | 'destination' | 'user';

export function createMarker(kind: MarkerKind, label: string): mapboxgl.Marker {
  const element = document.createElement('div');
  element.className = styles[kind] ?? '';
  element.setAttribute('role', 'img');
  element.setAttribute('aria-label', label);
  return new mapboxgl.Marker({ element });
}
