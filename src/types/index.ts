/** Níveis de risco usados em toda a aplicação. */
export type RiskLevel = 'low' | 'medium' | 'high';

/** Dimensões que o motor de risco avalia para pontuar um trecho. */
export type RiskFactorType = 'crime' | 'lighting' | 'footTraffic';

export interface RiskFactor {
  type: RiskFactorType;
  severity: RiskLevel;
  description: string;
}

export interface RouteSegment {
  id: string;
  name: string;
  riskLevel: RiskLevel;
  /** 0 = totalmente seguro, 100 = risco máximo. */
  riskScore: number;
  distanceMeters: number;
  /** O que gerou o risco deste trecho. */
  factors: RiskFactor[];
}

export interface Route {
  id: string;
  origin: string;
  destination: string;
  overallRisk: RiskLevel;
  overallScore: number;
  durationMinutes: number;
  distanceKm: number;
  segments: RouteSegment[];
}
