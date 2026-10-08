import * as Location from 'expo-location';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import {
  LocationContext,
  type LocationStatus,
  type UserLocationValue,
  type UserPosition,
} from './locationContext';

const WATCH_OPTIONS: Location.LocationOptions = {
  // Na moto, a posição precisa ser atual: leitura a cada segundo ou a cada poucos metros.
  accuracy: Location.Accuracy.BestForNavigation,
  timeInterval: 1_000,
  distanceInterval: 2,
};

const DENIED_MESSAGE =
  'Acesso à localização bloqueado. Libere nas configurações do celular para usar sua posição.';
const GPS_OFF_MESSAGE = 'O GPS do celular está desligado. Ligue a localização para usar sua posição.';
const UNAVAILABLE_MESSAGE = 'Não conseguimos obter sua localização. Tente de novo em instantes.';

/** O aparelho manda -1 (ou nada) quando parado ou sem a informação. */
const validOrNull = (value: number | null | undefined): number | null =>
  value !== null && value !== undefined && Number.isFinite(value) && value >= 0 ? value : null;

function toPosition({ coords, timestamp }: Location.LocationObject): UserPosition {
  return {
    coordinate: [coords.longitude, coords.latitude],
    heading: validOrNull(coords.heading),
    speed: validOrNull(coords.speed),
    accuracy: coords.accuracy ?? 0,
    timestamp,
  };
}

export interface LocationProviderProps {
  children: ReactNode;
}

/** Mesmo contrato do web (status, posição, erro, request), com o GPS do expo-location. */
export function LocationProvider({ children }: LocationProviderProps) {
  const [status, setStatus] = useState<LocationStatus>('idle');
  const [position, setPosition] = useState<UserPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);
  /** Evita dois pedidos de permissão em paralelo (toques seguidos no botão). */
  const startingRef = useRef(false);

  const stopWatching = useCallback(() => {
    subscriptionRef.current?.remove();
    subscriptionRef.current = null;
  }, []);

  const start = useCallback(async () => {
    if (subscriptionRef.current || startingRef.current) return;
    startingRef.current = true;
    setStatus((current) => (current === 'active' ? current : 'locating'));
    setError(null);

    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== Location.PermissionStatus.GRANTED) {
        setStatus('error');
        setError(DENIED_MESSAGE);
        return;
      }
      if (!(await Location.hasServicesEnabledAsync())) {
        setStatus('error');
        setError(GPS_OFF_MESSAGE);
        return;
      }

      subscriptionRef.current = await Location.watchPositionAsync(WATCH_OPTIONS, (location) => {
        setPosition(toPosition(location));
        setStatus('active');
        setError(null);
      });
    } catch {
      // Falha passageira: se já temos posição, mantemos a última conhecida.
      setStatus((current) => (current === 'active' ? current : 'error'));
      setError((current) => current ?? UNAVAILABLE_MESSAGE);
    } finally {
      startingRef.current = false;
    }
  }, []);

  const request = useCallback(() => {
    void start();
  }, [start]);

  // Só começa sozinho se a permissão já foi dada antes — nunca abre o pedido sem um toque.
  useEffect(() => {
    let cancelled = false;
    Location.getForegroundPermissionsAsync()
      .then((permission) => {
        if (!cancelled && permission.status === Location.PermissionStatus.GRANTED) void start();
      })
      .catch(() => {
        // Sem como consultar: espera o usuário pedir.
      });

    return () => {
      cancelled = true;
      stopWatching();
    };
  }, [start, stopWatching]);

  const value = useMemo<UserLocationValue>(
    () => ({ status, coordinate: position?.coordinate ?? null, position, error, request }),
    [status, position, error, request],
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}
