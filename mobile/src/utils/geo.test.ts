import type { Coordinate } from '@/types';

import { cumulativeDistances, distanceBetween, mostDistinctPoint, splitLineByDistance } from './geo';

/** Marco Zero do Recife. */
const MARCO_ZERO: Coordinate = [-34.871, -8.063];

describe('distanceBetween', () => {
  it('mede ~111 km por grau de latitude', () => {
    const oneDegreeNorth: Coordinate = [MARCO_ZERO[0], MARCO_ZERO[1] + 1];
    expect(distanceBetween(MARCO_ZERO, oneDegreeNorth)).toBeCloseTo(111_195, -2);
  });

  it('é zero para o mesmo ponto', () => {
    expect(distanceBetween(MARCO_ZERO, MARCO_ZERO)).toBe(0);
  });
});

describe('splitLineByDistance', () => {
  const line: Coordinate[] = [
    [-34.9, -8.12],
    [-34.9, -8.1],
    [-34.88, -8.1],
    [-34.88, -8.08],
  ];
  const total = cumulativeDistances(line).at(-1) ?? 0;

  it('divide em pedaços de mesmo comprimento', () => {
    const pieces = splitLineByDistance(line, 4);
    expect(pieces).toHaveLength(4);
    for (const piece of pieces) {
      const length = cumulativeDistances(piece).at(-1) ?? 0;
      expect(length).toBeCloseTo(total / 4, 0);
    }
  });

  it('os pedaços se encostam, sem buraco no mapa', () => {
    const pieces = splitLineByDistance(line, 3);
    for (let index = 1; index < pieces.length; index++) {
      expect(pieces[index]?.[0]).toEqual(pieces[index - 1]?.at(-1));
    }
    expect(pieces[0]?.[0]).toEqual(line[0]);
    expect(pieces.at(-1)?.at(-1)).toEqual(line.at(-1));
  });
});

describe('mostDistinctPoint', () => {
  // Duas rotas com mesma saída e chegada; a segunda faz um desvio para o leste no meio.
  const straight: Coordinate[] = [
    [-34.9, -8.12],
    [-34.9, -8.11],
    [-34.9, -8.1],
    [-34.9, -8.09],
    [-34.9, -8.08],
  ];
  const detour: Coordinate[] = [
    [-34.9, -8.12],
    [-34.89, -8.11],
    [-34.87, -8.1],
    [-34.89, -8.09],
    [-34.9, -8.08],
  ];

  it('escolhe o ponto onde a rota mais se afasta das outras', () => {
    expect(mostDistinctPoint(detour, [straight])).toEqual([-34.87, -8.1]);
  });

  it('sem outras rotas, usa o meio da linha', () => {
    expect(mostDistinctPoint(straight, [])).toEqual([-34.9, -8.1]);
  });

  it('linha vazia não tem ponto', () => {
    expect(mostDistinctPoint([], [straight])).toBeNull();
  });
});
