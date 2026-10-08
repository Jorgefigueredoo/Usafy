import { describe, expect, it } from 'vitest';

import { lowerFirst, spokenDistance, spokenDuration } from './voice';

describe('spokenDistance', () => {
  it('arredonda metros de 50 em 50, como se fala', () => {
    expect(spokenDistance(347)).toBe('350 metros');
    expect(spokenDistance(310)).toBe('300 metros');
  });

  it('nunca diz menos de 50 metros', () => {
    expect(spokenDistance(12)).toBe('50 metros');
  });

  it('usa quilômetros a partir de 1 km, no singular e no plural', () => {
    expect(spokenDistance(1000)).toBe('1 quilômetro');
    expect(spokenDistance(1540)).toBe('1,5 quilômetros');
    expect(spokenDistance(2000)).toBe('2 quilômetros');
  });
});

describe('spokenDuration', () => {
  it('fala minutos no singular e no plural', () => {
    expect(spokenDuration(1)).toBe('1 minuto');
    expect(spokenDuration(17.4)).toBe('17 minutos');
  });

  it('nunca diz zero minuto', () => {
    expect(spokenDuration(0.2)).toBe('1 minuto');
  });

  it('junta horas e minutos', () => {
    expect(spokenDuration(60)).toBe('1 hora');
    expect(spokenDuration(65)).toBe('1 hora e 5 minutos');
    expect(spokenDuration(121)).toBe('2 horas e 1 minuto');
  });
});

describe('lowerFirst', () => {
  it('encaixa a instrução depois de "Em 300 metros,"', () => {
    expect(lowerFirst('Vire à direita na Rua X')).toBe('vire à direita na Rua X');
    expect(lowerFirst('Á frente')).toBe('á frente');
  });
});
