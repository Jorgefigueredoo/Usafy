import type { RiskLevel } from '../types/index.ts';

/** Paleta única do Usafy. Nenhuma página declara cor literal — tudo passa por aqui. */
export const colors = {
  background: '#0F1E2E',
  surface: '#1A3A5C',
  primary: '#2563A8',
  accent: '#E07B2A',
  riskLow: '#1E7D4F',
  riskMedium: '#D97706',
  riskHigh: '#B91C1C',
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',
  border: '#2A4A6B',

  // Derivados dos tokens acima, para estados de interação e superfícies internas.
  primaryHover: '#2B6FBC',
  primaryPressed: '#1C4E85',
  surfaceElevated: '#204A72',
  surfaceSunken: '#14304B',
  overlay: 'rgba(255, 255, 255, 0.06)',
  scrim: 'rgba(15, 30, 46, 0.92)',
  shadow: 'rgba(0, 0, 0, 0.35)',
  /** Halo pulsante em volta do ponto "você está aqui" (primary translúcido). */
  locationPulse: 'rgba(37, 99, 168, 0.35)',
  danger: '#EF6C6C',
  dangerSurface: '#3A1A1A',
} as const;

/** Cor de preenchimento (traçado no mapa, barras, marcadores) por nível de risco. */
export const riskFillColors: Record<RiskLevel, string> = {
  low: colors.riskLow,
  medium: colors.riskMedium,
  high: colors.riskHigh,
};

/**
 * Versões claras dos tons de risco. As cores de preenchimento são escuras demais
 * para texto sobre o fundo #0F1E2E, então rótulos e ícones usam estas.
 */
export const riskToneColors: Record<RiskLevel, string> = {
  low: '#35C489',
  medium: '#F0A73C',
  high: '#EF6C6C',
};

/** Fundo discreto dos chips de risco, mantendo contraste com riskToneColors. */
export const riskSurfaceColors: Record<RiskLevel, string> = {
  low: '#123528',
  medium: '#3A2A14',
  high: '#3A1A1A',
};
