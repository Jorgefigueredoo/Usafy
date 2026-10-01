import type { UserPosition } from '@/hooks/locationContext';
import type { Coordinate, Maneuver, Route } from '@/types';
import { bearingBetween, cumulativeDistances, projectOntoLine, sliceLineUntil } from '@/utils/geo';

/** Longe assim da linha (ou mais que a imprecisão do GPS), consideramos fora da rota. */
const OFF_ROUTE_METERS = 40;
/** Distância restante abaixo da qual consideramos que o usuário chegou. */
const ARRIVAL_METERS = 30;
/** Quanto à frente na rota olhamos para orientar a câmera — suaviza o zigue-zague da linha. */
const BEARING_LOOKAHEAD_METERS = 25;
/** Margem para não anunciar uma manobra pela qual o usuário acabou de passar. */
const MANEUVER_PASSED_METERS = 5;

/**
 * Dados derivados da rota que não mudam a cada leitura do GPS. Distâncias da
 * geometria (haversine) diferem um pouco das do Directions; `scale` converte.
 */
export interface RouteTrack {
  route: Route;
  distances: number[];
  geometryMeters: number;
  /** Metros "do Directions" por metro de geometria. */
  scale: number;
}

export function buildTrack(route: Route): RouteTrack {
  const distances = cumulativeDistances(route.geometry);
  const geometryMeters = distances[distances.length - 1] ?? 0;
  const routeMeters = route.distanceKm * 1000;
  return { route, distances, geometryMeters, scale: geometryMeters > 0 ? routeMeters / geometryMeters : 1 };
}

export interface NavigationProgress {
  /** Onde desenhar o usuário: encaixado na linha quando está na rota, senão a leitura crua. */
  displayPosition: Coordinate;
  /** Direção para a câmera e a seta, em graus a partir do norte. */
  bearing: number;
  onRoute: boolean;
  distanceFromRouteMeters: number;
  traveledMeters: number;
  remainingMeters: number;
  remainingMinutes: number;
  /** Horário previsto de chegada (ms desde epoch). */
  arrivalTimestamp: number;
  /** Índice em `route.segments` do trecho onde o usuário está. */
  segmentIndex: number;
  nextManeuver: Maneuver | null;
  metersToNextManeuver: number;
  arrived: boolean;
  /** Parte da rota já percorrida, para desenhar apagada no mapa. */
  traveledLine: Coordinate[];
}

export function computeProgress(track: RouteTrack, position: UserPosition): NavigationProgress {
  const { route, distances, geometryMeters, scale } = track;
  const projection = projectOntoLine(route.geometry, distances, position.coordinate);

  const onRoute = projection.distanceToLine <= Math.max(OFF_ROUTE_METERS, position.accuracy);
  const alongGeometry = projection.distanceAlong;
  const traveledMeters = alongGeometry * scale;
  const routeMeters = route.distanceKm * 1000;
  const remainingMeters = Math.max(0, routeMeters - traveledMeters);
  const remainingMinutes = routeMeters > 0 ? route.durationMinutes * (remainingMeters / routeMeters) : 0;

  const ahead = sliceLineUntil(
    route.geometry,
    distances,
    Math.min(geometryMeters, alongGeometry + BEARING_LOOKAHEAD_METERS),
  ).at(-1);

  // Na rota, a própria linha dá a direção (estável mesmo parado no semáforo). Fora dela,
  // vale a bússola do GPS em movimento; sem ela, apontamos de volta para a rota.
  let bearing = ahead ? bearingBetween(projection.point, ahead) : 0;
  if (!onRoute) {
    bearing = position.heading ?? (ahead ? bearingBetween(position.coordinate, ahead) : bearing);
  }

  const segmentCount = route.segments.length;
  const segmentLength = segmentCount > 0 ? geometryMeters / segmentCount : geometryMeters;
  const segmentIndex =
    segmentLength > 0 ? Math.min(segmentCount - 1, Math.floor(alongGeometry / segmentLength)) : 0;

  const nextManeuver =
    route.maneuvers.find((m) => m.distanceFromStartMeters > traveledMeters + MANEUVER_PASSED_METERS) ?? null;

  return {
    displayPosition: onRoute ? projection.point : position.coordinate,
    bearing,
    onRoute,
    distanceFromRouteMeters: projection.distanceToLine,
    traveledMeters,
    remainingMeters,
    remainingMinutes,
    arrivalTimestamp: position.timestamp + remainingMinutes * 60_000,
    segmentIndex: Math.max(0, segmentIndex),
    nextManeuver,
    metersToNextManeuver: nextManeuver ? nextManeuver.distanceFromStartMeters - traveledMeters : 0,
    arrived: onRoute && remainingMeters <= ARRIVAL_METERS,
    traveledLine: sliceLineUntil(route.geometry, distances, alongGeometry),
  };
}
