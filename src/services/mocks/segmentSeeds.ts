import type { RouteSegment } from '@/types';

/** Trecho sem os campos derivados (`id` e `riskLevel` saem do score). */
export type SegmentSeed = Omit<RouteSegment, 'id' | 'riskLevel'>;

/**
 * Trechos reais do Recife agrupados por faixa de risco. A rota mockada tira um
 * trecho de cada grupo, garantindo que a UI sempre exiba as três cores.
 */
export const LOW_RISK_SEEDS: SegmentSeed[] = [
  {
    name: 'Av. Conselheiro Aguiar — Boa Viagem',
    riskScore: 18,
    distanceMeters: 1400,
    factors: [
      { type: 'lighting', severity: 'low', description: 'Iluminação de LED em toda a extensão da via.' },
      { type: 'footTraffic', severity: 'low', description: 'Comércio ativo e fluxo constante de pedestres.' },
    ],
  },
  {
    name: 'Rua Ribeiro de Brito — Graças',
    riskScore: 24,
    distanceMeters: 980,
    factors: [
      { type: 'crime', severity: 'low', description: 'Nenhuma ocorrência registrada nos últimos 90 dias.' },
      { type: 'lighting', severity: 'low', description: 'Postes revisados pela prefeitura em 2025.' },
    ],
  },
];

export const MEDIUM_RISK_SEEDS: SegmentSeed[] = [
  {
    name: 'Ponte Paulo Guerra — Pina',
    riskScore: 52,
    distanceMeters: 760,
    factors: [
      { type: 'lighting', severity: 'medium', description: 'Iluminação irregular no vão sobre o rio.' },
      { type: 'footTraffic', severity: 'medium', description: 'Fluxo cai bastante fora do horário comercial.' },
    ],
  },
  {
    name: 'Estrada do Arraial — Casa Amarela',
    riskScore: 58,
    distanceMeters: 1600,
    factors: [
      { type: 'crime', severity: 'medium', description: 'Abordagens a motociclistas relatadas no fim da tarde.' },
      { type: 'footTraffic', severity: 'medium', description: 'Comércio fecha cedo e a via esvazia à noite.' },
    ],
  },
];

export const HIGH_RISK_SEEDS: SegmentSeed[] = [
  {
    name: 'Viaduto Agamenon Magalhães — Santo Amaro',
    riskScore: 81,
    distanceMeters: 1100,
    factors: [
      { type: 'crime', severity: 'high', description: 'Alto índice de roubo de motos no cruzamento.' },
      { type: 'lighting', severity: 'high', description: 'Vários pontos de luz apagados sob o viaduto.' },
      { type: 'footTraffic', severity: 'medium', description: 'Área esvaziada depois das 20h.' },
    ],
  },
  {
    name: 'Av. Sul — Santo Amaro',
    riskScore: 74,
    distanceMeters: 1250,
    factors: [
      { type: 'crime', severity: 'high', description: 'Ocorrências concentradas perto do terminal.' },
      { type: 'lighting', severity: 'medium', description: 'Iluminação apenas parcial nas laterais.' },
    ],
  },
];
