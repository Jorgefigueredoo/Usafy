import type { Coordinate } from '@/types';

const EARTH_RADIUS_METERS = 6_371_000;

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

/** Distância em linha reta entre dois pontos (fórmula de haversine). */
export function distanceBetween([lng1, lat1]: Coordinate, [lng2, lat2]: Coordinate): number {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(a));
}

/** Distância acumulada (m) do início da linha até cada vértice. */
export function cumulativeDistances(line: Coordinate[]): number[] {
  const result: number[] = [];
  let total = 0;
  line.forEach((point, index) => {
    const previous = line[index - 1];
    if (previous) total += distanceBetween(previous, point);
    result.push(total);
  });
  return result;
}

function interpolate([lng1, lat1]: Coordinate, [lng2, lat2]: Coordinate, t: number): Coordinate {
  return [lng1 + (lng2 - lng1) * t, lat1 + (lat2 - lat1) * t];
}

/**
 * Corta uma linha em `parts` pedaços de mesmo comprimento. Os pontos de corte são
 * interpolados e repetidos no fim de um pedaço e no início do seguinte, para que
 * os trechos se encostem no mapa sem buracos.
 */
export function splitLineByDistance(line: Coordinate[], parts: number): Coordinate[][] {
  const distances = cumulativeDistances(line);
  const total = distances[distances.length - 1] ?? 0;
  const pieces: Coordinate[][] = [];

  let vertex = 0;
  let current: Coordinate[] = line[0] ? [line[0]] : [];

  for (let part = 1; part < parts; part++) {
    const target = (total * part) / parts;

    // Avança pelos vértices que ficam antes do ponto de corte.
    while (vertex + 1 < line.length && (distances[vertex + 1] ?? 0) <= target) {
      vertex++;
      const point = line[vertex];
      if (point) current.push(point);
    }

    const from = line[vertex];
    const to = line[vertex + 1];
    const fromDistance = distances[vertex] ?? 0;
    const toDistance = distances[vertex + 1] ?? fromDistance;
    if (!from) break;

    const span = toDistance - fromDistance;
    const cut = to && span > 0 ? interpolate(from, to, (target - fromDistance) / span) : from;

    current.push(cut);
    pieces.push(current);
    current = [cut];
  }

  current.push(...line.slice(vertex + 1));
  pieces.push(current);
  return pieces;
}
