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

/** Rumo de `from` para `to`, em graus a partir do norte (0–360, sentido horário). */
export function bearingBetween([lng1, lat1]: Coordinate, [lng2, lat2]: Coordinate): number {
  const lat1Rad = toRadians(lat1);
  const lat2Rad = toRadians(lat2);
  const deltaLng = toRadians(lng2 - lng1);
  const y = Math.sin(deltaLng) * Math.cos(lat2Rad);
  const x =
    Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(deltaLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

export interface LineProjection {
  /** Ponto da linha mais próximo do ponto original. */
  point: Coordinate;
  /** Distância (m) do ponto original até a linha. */
  distanceToLine: number;
  /** Distância (m) percorrida ao longo da linha até `point`. */
  distanceAlong: number;
  /** Índice do vértice que inicia o pedaço onde `point` caiu. */
  vertexIndex: number;
}

/**
 * Projeta um ponto na polilinha. Usa uma projeção plana local (metros em torno do
 * ponto), precisa o bastante na escala de uma rota urbana.
 */
export function projectOntoLine(line: Coordinate[], distances: number[], point: Coordinate): LineProjection {
  const [lng0, lat0] = point;
  const metersPerLat = (Math.PI / 180) * EARTH_RADIUS_METERS;
  const metersPerLng = metersPerLat * Math.cos(toRadians(lat0));
  const toLocal = ([lng, lat]: Coordinate): [number, number] => [
    (lng - lng0) * metersPerLng,
    (lat - lat0) * metersPerLat,
  ];

  let best: LineProjection = {
    point: line[0] ?? point,
    distanceToLine: Infinity,
    distanceAlong: 0,
    vertexIndex: 0,
  };

  for (let i = 0; i < line.length - 1; i++) {
    const a = line[i];
    const b = line[i + 1];
    if (!a || !b) continue;

    const [ax, ay] = toLocal(a);
    const [bx, by] = toLocal(b);
    const dx = bx - ax;
    const dy = by - ay;
    const lengthSq = dx * dx + dy * dy;
    // O ponto original é a origem (0, 0) do plano local.
    const t = lengthSq === 0 ? 0 : Math.min(1, Math.max(0, -(ax * dx + ay * dy) / lengthSq));
    const px = ax + dx * t;
    const py = ay + dy * t;
    const distance = Math.hypot(px, py);

    if (distance < best.distanceToLine) {
      best = {
        point: interpolate(a, b, t),
        distanceToLine: distance,
        distanceAlong: (distances[i] ?? 0) + Math.sqrt(lengthSq) * t,
        vertexIndex: i,
      };
    }
  }
  return best;
}

/** Parte da linha do início até `distance` metros (usada para o trecho já percorrido). */
export function sliceLineUntil(line: Coordinate[], distances: number[], distance: number): Coordinate[] {
  const result: Coordinate[] = [];
  for (let i = 0; i < line.length; i++) {
    const point = line[i];
    const pointDistance = distances[i] ?? 0;
    if (!point) break;
    if (pointDistance <= distance) {
      result.push(point);
      continue;
    }
    const previous = line[i - 1];
    const previousDistance = distances[i - 1] ?? 0;
    const span = pointDistance - previousDistance;
    if (previous && span > 0) {
      result.push(interpolate(previous, point, (distance - previousDistance) / span));
    }
    break;
  }
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
