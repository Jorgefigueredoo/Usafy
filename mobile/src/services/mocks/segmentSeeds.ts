import type { RouteSegment } from '@/types';

/** Trecho sem os campos derivados (`id` e `riskLevel` saem do score). */
export type SegmentSeed = Omit<RouteSegment, 'id' | 'riskLevel'>;

/**
 * Trechos reais do Recife agrupados por faixa de risco. A rota mockada tira um
 * trecho de cada grupo, garantindo que a UI sempre exiba as três cores.
 * `coordinates` são [longitude, latitude] aproximadas de cada bairro.
 */
export const LOW_RISK_SEEDS: SegmentSeed[] = [
  {
    name: 'Av. Conselheiro Aguiar — Boa Viagem',
    riskScore: 18,
    distanceMeters: 1400,
    coordinates: [[-34.8925, -8.1115], [-34.895, -8.12], [-34.899, -8.129]],
    factors: [
      { type: 'lighting', severity: 'low', description: 'Iluminação de LED em toda a extensão da via.' },
      { type: 'footTraffic', severity: 'low', description: 'Comércio ativo e fluxo constante de pedestres.' },
    ],
  },
  {
    name: 'Rua Ribeiro de Brito — Graças',
    riskScore: 24,
    distanceMeters: 980,
    coordinates: [[-34.8985, -8.044], [-34.8998, -8.042], [-34.901, -8.0405]],
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
    coordinates: [[-34.89, -8.085], [-34.888, -8.0878], [-34.886, -8.0905]],
    factors: [
      { type: 'lighting', severity: 'medium', description: 'Iluminação irregular no vão sobre o rio.' },
      { type: 'footTraffic', severity: 'medium', description: 'Fluxo cai bastante fora do horário comercial.' },
    ],
  },
  {
    name: 'Estrada do Arraial — Casa Amarela',
    riskScore: 58,
    distanceMeters: 1600,
    coordinates: [[-34.919, -8.03], [-34.9165, -8.0265], [-34.914, -8.0235]],
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
    coordinates: [[-34.8815, -8.0525], [-34.8805, -8.0507], [-34.879, -8.049]],
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
    coordinates: [[-34.886, -8.052], [-34.883, -8.054], [-34.88, -8.056]],
    factors: [
      { type: 'crime', severity: 'high', description: 'Ocorrências concentradas perto do terminal.' },
      { type: 'lighting', severity: 'medium', description: 'Iluminação apenas parcial nas laterais.' },
    ],
  },
];
