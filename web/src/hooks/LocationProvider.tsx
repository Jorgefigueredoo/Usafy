import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import type { Coordinate } from '@/types';

import { LocationContext, type LocationStatus, type UserLocationValue } from './locationContext';

const WATCH_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  // Aceita uma leitura de até 30 s atrás: a moto anda, mas o primeiro ponto sai na hora.
  maximumAge: 30_000,
  timeout: 15_000,
};

function messageFor(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'Acesso à localização bloqueado. Libere nas configurações do navegador para usar sua posição.';
    case error.POSITION_UNAVAILABLE:
      return 'Não conseguimos obter sua localização. Verifique se o GPS está ligado.';
    default:
      return 'A localização demorou a responder. Tente de novo.';
  }
}

function unsupportedMessage(): string | null {
  if (!window.isSecureContext) return 'A localização só funciona com o app aberto em HTTPS.';
  if (!('geolocation' in navigator)) return 'Este navegador não informa a localização.';
  return null;
}

export interface LocationProviderProps {
  children: ReactNode;
}

export function LocationProvider({ children }: LocationProviderProps) {
  const [status, setStatus] = useState<LocationStatus>('idle');
  const [coordinate, setCoordinate] = useState<Coordinate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    watchIdRef.current = null;
  }, []);

  const request = useCallback(() => {
    const unsupported = unsupportedMessage();
    if (unsupported) {
      setStatus('error');
      setError(unsupported);
      return;
    }
    if (watchIdRef.current !== null) return;

    setStatus((current) => (current === 'active' ? current : 'locating'));
    setError(null);

    watchIdRef.current = navigator.geolocation.watchPosition(
      ({ coords }) => {
        setCoordinate([coords.longitude, coords.latitude]);
        setStatus('active');
        setError(null);
      },
      (positionError) => {
        if (positionError.code === positionError.PERMISSION_DENIED) {
          stopWatching();
          setCoordinate(null);
          setStatus('error');
          setError(messageFor(positionError));
          return;
        }
        // Falha passageira (túnel, timeout): se já temos posição, mantemos a última conhecida.
        setStatus((current) => (current === 'active' ? current : 'error'));
        setError((current) => current ?? messageFor(positionError));
      },
      WATCH_OPTIONS,
    );
  }, [stopWatching]);

  // Só começa sozinho se a permissão já foi dada antes — nunca abre o pop-up sem um toque do usuário.
  useEffect(() => {
    if (unsupportedMessage() || !('permissions' in navigator)) return;

    let cancelled = false;
    navigator.permissions
      .query({ name: 'geolocation' })
      .then((permission) => {
        if (!cancelled && permission.state === 'granted') request();
      })
      .catch(() => {
        // Permissions API indisponível: espera o usuário pedir.
      });

    return () => {
      cancelled = true;
      stopWatching();
    };
  }, [request, stopWatching]);

  const value = useMemo<UserLocationValue>(
    () => ({ status, coordinate, error, request }),
    [status, coordinate, error, request],
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}
