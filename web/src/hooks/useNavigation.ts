import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { buildTrack, computeProgress, type NavigationProgress } from '@/services/navigation';
import { getRoute, RouteServiceError } from '@/services/routeService';
import type { Route } from '@/types';

import { useCurrentRoute } from './useCurrentRoute';
import { useUserLocation } from './useUserLocation';
import { useWakeLock } from './useWakeLock';

/** Leituras seguidas fora da rota antes de recalcular — uma só costuma ser ruído do GPS. */
const OFF_ROUTE_READINGS_TO_REROUTE = 2;
/** Intervalo mínimo entre recálculos, para não martelar a API do Mapbox. */
const REROUTE_COOLDOWN_MS = 15_000;
const HIGH_RISK_VIBRATION_MS = [200, 120, 200];

export type NavigationPhase = 'waiting' | 'navigating' | 'rerouting' | 'arrived';

export interface NavigationState {
  active: boolean;
  phase: NavigationPhase;
  /** A câmera acompanha o usuário? Vira `false` quando ele arrasta o mapa. */
  following: boolean;
  progress: NavigationProgress | null;
  /** Problema a mostrar no banner (GPS negado, falha ao recalcular...). */
  message: string | null;
  start: () => void;
  stop: () => void;
  recenter: () => void;
  pauseFollowing: () => void;
}

export function useNavigation(route: Route): NavigationState {
  const { setRoute } = useCurrentRoute();
  const location = useUserLocation();

  const [active, setActive] = useState(false);
  const [following, setFollowing] = useState(true);
  const [rerouting, setRerouting] = useState(false);
  const [rerouteError, setRerouteError] = useState<string | null>(null);

  const offRouteReadingsRef = useRef(0);
  const lastCountedReadingRef = useRef<number | null>(null);
  const lastRerouteAtRef = useRef(0);
  const lastSegmentIndexRef = useRef<number | null>(null);

  useWakeLock(active);

  const track = useMemo(() => buildTrack(route), [route]);
  const progress = useMemo(
    () => (active && location.position ? computeProgress(track, location.position) : null),
    [active, location.position, track],
  );

  const reroute = useCallback(async () => {
    const position = location.position;
    const destination = route.geometry[route.geometry.length - 1];
    if (!position || !destination) return;

    lastRerouteAtRef.current = position.timestamp;
    offRouteReadingsRef.current = 0;
    setRerouting(true);
    try {
      const updated = await getRoute(
        { label: 'Minha localização', coordinate: position.coordinate },
        { label: route.destination, coordinate: destination },
      );
      setRoute(updated);
      setRerouteError(null);
    } catch (error) {
      // Segue guiando pela rota antiga; tenta de novo depois do cooldown.
      setRerouteError(
        error instanceof RouteServiceError ? error.message : 'Não foi possível recalcular a rota agora.',
      );
    } finally {
      setRerouting(false);
    }
  }, [location.position, route, setRoute]);

  // Saiu da rota por mais de uma leitura seguida → recalcula a partir de onde o usuário está.
  useEffect(() => {
    if (!progress || !location.position || progress.arrived || rerouting) return;
    // O efeito também roda quando `rerouting` muda; cada leitura do GPS conta uma vez só.
    if (location.position.timestamp === lastCountedReadingRef.current) return;
    lastCountedReadingRef.current = location.position.timestamp;

    offRouteReadingsRef.current = progress.onRoute ? 0 : offRouteReadingsRef.current + 1;
    const cooledDown = location.position.timestamp - lastRerouteAtRef.current >= REROUTE_COOLDOWN_MS;
    if (offRouteReadingsRef.current >= OFF_ROUTE_READINGS_TO_REROUTE && cooledDown) void reroute();
  }, [progress, location.position, rerouting, reroute]);

  // Ao entrar num trecho de risco alto, vibra — o entregador não precisa olhar a tela.
  useEffect(() => {
    if (!progress) {
      lastSegmentIndexRef.current = null;
      return;
    }
    const previous = lastSegmentIndexRef.current;
    lastSegmentIndexRef.current = progress.segmentIndex;
    if (previous === null || previous === progress.segmentIndex) return;
    if (route.segments[progress.segmentIndex]?.riskLevel === 'high') {
      navigator.vibrate?.(HIGH_RISK_VIBRATION_MS);
    }
  }, [progress, route.segments]);

  const start = useCallback(() => {
    location.request();
    offRouteReadingsRef.current = 0;
    setRerouteError(null);
    setFollowing(true);
    setActive(true);
  }, [location]);

  const stop = useCallback(() => {
    setActive(false);
    setRerouting(false);
    setRerouteError(null);
  }, []);

  const recenter = useCallback(() => setFollowing(true), []);
  const pauseFollowing = useCallback(() => setFollowing(false), []);

  let phase: NavigationPhase = 'waiting';
  if (rerouting) phase = 'rerouting';
  else if (progress?.arrived) phase = 'arrived';
  else if (progress) phase = 'navigating';

  const message =
    active && location.status === 'error' && !location.position ? location.error : rerouteError;

  return { active, phase, following, progress, message, start, stop, recenter, pauseFollowing };
}
