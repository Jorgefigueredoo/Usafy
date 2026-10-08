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

/**
 * Cores do mapa base (estilo Mapbox Standard) com a identidade do Usafy. As chaves são os
 * nomes de configuração do Standard. O mapa fica em tons de azul e cinza de propósito:
 * verde, âmbar e vermelho ficam reservados para o risco da rota, que precisa se destacar.
 * A iluminação do Standard (dia, entardecer, noite) é aplicada por cima destas cores.
 */
export const mapPalettes = {
  day: {
    colorLand: '#EEF2F7',
    colorWater: '#8DB6E2',
    colorGreenspace: '#CFE6D8',
    colorCommercial: '#E6EBF2',
    colorEducation: '#E3E9F1',
    colorMedical: '#EBE5EC',
    colorIndustrial: '#E1E5EB',
    colorBuildings: '#DCE3EC',
    colorRoads: '#FFFFFF',
    colorTrunks: '#D5E3F4',
    colorMotorways: '#A8C5EA',
    colorPlaceLabels: '#0F1E2E',
    colorRoadLabels: '#1A3A5C',
    colorPointOfInterestLabels: '#2563A8',
    colorAdminBoundaries: '#94A3B8',
  },
  night: {
    colorLand: '#16304A',
    colorWater: '#0C2338',
    colorGreenspace: '#17402F',
    colorCommercial: '#1A3652',
    colorEducation: '#1A3652',
    colorMedical: '#1E3550',
    colorIndustrial: '#183248',
    colorBuildings: '#24496F',
    colorRoads: '#3A5F86',
    colorTrunks: '#4A77A6',
    colorMotorways: '#5C8FC6',
    colorPlaceLabels: '#F1F5F9',
    colorRoadLabels: '#B6C4D6',
    colorPointOfInterestLabels: '#8DB6E2',
    colorAdminBoundaries: '#4F6B8A',
  },
} as const;
