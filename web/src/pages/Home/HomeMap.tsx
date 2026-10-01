import type { Map as MapboxMap, Marker } from 'mapbox-gl';
import { useEffect, useRef, useState } from 'react';

import { createMap, createMarker, MapFallback, onMapFatalError } from '@/components/map';
import { Icon, Spinner } from '@/components/ui';
import { MAPBOX_TOKEN, RECIFE_CENTER } from '@/services/mapboxConfig';
import type { Coordinate } from '@/types';

import styles from './HomeMap.module.css';

export interface HomeMapProps {
  userLocation: Coordinate | null;
  locating: boolean;
  /** Chamado quando o usuário pede a localização e ainda não temos posição. */
  onRequestLocation: () => void;
}

const CITY_ZOOM = 11.5;
const STREET_ZOOM = 15;

/** Mapa de contexto da Home: mostra onde o usuário está antes de escolher o destino. */
export default function HomeMap({ userLocation, locating, onRequestLocation }: HomeMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const userMarkerRef = useRef<Marker | null>(null);
  /** Centraliza automaticamente só na primeira posição; depois o usuário manda no mapa. */
  const hasCenteredRef = useRef(false);
  const [initialCenter] = useState(userLocation);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !MAPBOX_TOKEN) return;

    const map = createMap(container, {
      center: initialCenter ?? RECIFE_CENTER,
      zoom: initialCenter ? STREET_ZOOM : CITY_ZOOM,
    });
    mapRef.current = map;
    hasCenteredRef.current = initialCenter !== null;
    onMapFatalError(map, () => setFailed(true));

    return () => {
      map.remove();
      mapRef.current = null;
      userMarkerRef.current = null;
    };
  }, [initialCenter]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userLocation) return;

    userMarkerRef.current ??= createMarker('user', 'Você está aqui').setLngLat(userLocation).addTo(map);
    userMarkerRef.current.setLngLat(userLocation);

    if (!hasCenteredRef.current) {
      map.flyTo({ center: userLocation, zoom: STREET_ZOOM });
      hasCenteredRef.current = true;
    }
  }, [userLocation]);

  const handleLocate = () => {
    const map = mapRef.current;
    if (map && userLocation) {
      map.easeTo({ center: userLocation, zoom: Math.max(map.getZoom(), STREET_ZOOM) });
    } else {
      hasCenteredRef.current = false;
      onRequestLocation();
    }
  };

  if (!MAPBOX_TOKEN || failed) return <MapFallback />;

  return (
    <>
      <div ref={containerRef} className={styles.map} aria-label="Mapa da sua região" />
      <button
        type="button"
        className={styles.locate}
        onClick={handleLocate}
        data-active={userLocation !== null}
        aria-label={userLocation ? 'Centralizar na minha localização' : 'Mostrar minha localização'}
      >
        {locating ? <Spinner label="Obtendo localização" /> : <Icon name="locate" />}
      </button>
    </>
  );
}
