import type { RiskFactor, RiskFactorType, RiskLevel } from '@/types';

/**
 * Risco FICTÍCIO por trecho. Nada aqui reflete dados reais de criminalidade,
 * iluminação ou movimento — só alimenta a UI enquanto o backend não existe.
 */

export interface MockRisk {
  riskLevel: RiskLevel;
  riskScore: number;
  factors: RiskFactor[];
}

/** Gerador pseudoaleatório que devolve números em [0, 1). */
export type Random = () => number;

/**
 * PRNG com semente (mulberry32). A mesma busca gera sempre o mesmo risco, para
 * a rota não "mudar de cor" quando o usuário refaz a pesquisa.
 */
export function createSeededRandom(seedText: string): Random {
  let seed = 0;
  for (let i = 0; i < seedText.length; i++) {
    seed = Math.imul(seed ^ seedText.charCodeAt(i), 0x9e3779b1);
  }
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

/** Pesos do sorteio: leve preferência por trechos seguros. */
const LEVEL_WEIGHTS: [RiskLevel, number][] = [
  ['low', 0.5],
  ['medium', 0.3],
  ['high', 0.2],
];

/** Faixa de score [mín, máx] coerente com riskLevelFromScore. */
const SCORE_RANGES: Record<RiskLevel, [number, number]> = {
  low: [8, 33],
  medium: [34, 66],
  high: [67, 94],
};

const FACTOR_DESCRIPTIONS: Record<RiskFactorType, Record<RiskLevel, string[]>> = {
  crime: {
    low: ['Nenhuma ocorrência registrada nos últimos 90 dias.', 'Baixo índice de roubos na região.'],
    medium: [
      'Abordagens a motociclistas relatadas no fim da tarde.',
      'Ocorrências pontuais perto de semáforos.',
    ],
    high: ['Alto índice de roubo de motos no trecho.', 'Ocorrências frequentes após as 19h.'],
  },
  lighting: {
    low: ['Iluminação de LED em toda a extensão da via.', 'Postes revisados recentemente.'],
    medium: ['Iluminação irregular em parte do trecho.', 'Alguns pontos de luz apagados.'],
    high: ['Vários postes apagados ou quebrados.', 'Trecho praticamente sem iluminação à noite.'],
  },
  footTraffic: {
    low: ['Comércio ativo e fluxo constante de pedestres.', 'Movimento intenso durante todo o dia.'],
    medium: ['Fluxo cai bastante fora do horário comercial.', 'Comércio fecha cedo e a via esvazia.'],
    high: ['Área deserta depois das 20h.', 'Pouquíssimo movimento de pessoas.'],
  },
};

const FACTOR_TYPES: RiskFactorType[] = ['crime', 'lighting', 'footTraffic'];
const LEVELS: RiskLevel[] = ['low', 'medium', 'high'];

function pick<T>(items: readonly T[], random: Random): T {
  const item = items[Math.floor(random() * items.length)];
  if (item === undefined) throw new Error('pick() chamado com lista vazia');
  return item;
}

function pickLevel(random: Random): RiskLevel {
  let roll = random();
  for (const [level, weight] of LEVEL_WEIGHTS) {
    if (roll < weight) return level;
    roll -= weight;
  }
  return 'low';
}

/** Um nível abaixo, para o fator secundário não "gritar" tanto quanto o principal. */
function softer(level: RiskLevel): RiskLevel {
  return LEVELS[Math.max(0, LEVELS.indexOf(level) - 1)] ?? 'low';
}

function buildFactors(level: RiskLevel, random: Random): RiskFactor[] {
  const count = random() < 0.5 ? 1 : 2;
  const types = [...FACTOR_TYPES].sort(() => random() - 0.5).slice(0, count);

  return types.map((type, index) => {
    const severity = index === 0 ? level : softer(level);
    return { type, severity, description: pick(FACTOR_DESCRIPTIONS[type][severity], random) };
  });
}

export function mockSegmentRisk(random: Random): MockRisk {
  const riskLevel = pickLevel(random);
  const [min, max] = SCORE_RANGES[riskLevel];
  const riskScore = Math.round(min + random() * (max - min));
  return { riskLevel, riskScore, factors: buildFactors(riskLevel, random) };
}
