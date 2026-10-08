import type { RiskFactorType, RiskLevel } from '@/types';

/** Limites inferiores (inclusivos) das faixas de score 0–100. */
export const MEDIUM_RISK_THRESHOLD = 34;
export const HIGH_RISK_THRESHOLD = 67;

export function riskLevelFromScore(score: number): RiskLevel {
  if (score < MEDIUM_RISK_THRESHOLD) return 'low';
  if (score < HIGH_RISK_THRESHOLD) return 'medium';
  return 'high';
}

/** Rótulo curto, para chips e legendas. */
export const RISK_LABELS: Record<RiskLevel, string> = {
  low: 'Seguro',
  medium: 'Atenção',
  high: 'Risco alto',
};

/** Rótulo descritivo, para o resumo geral da rota. */
export const RISK_SUMMARY_LABELS: Record<RiskLevel, string> = {
  low: 'Risco baixo',
  medium: 'Risco moderado',
  high: 'Risco alto',
};

export const RISK_FACTOR_LABELS: Record<RiskFactorType, string> = {
  crime: 'Criminalidade',
  lighting: 'Iluminação',
  footTraffic: 'Fluxo de pessoas',
};
