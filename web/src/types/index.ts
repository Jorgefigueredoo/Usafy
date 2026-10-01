/** Níveis de risco usados em toda a aplicação. */
export type RiskLevel = 'low' | 'medium' | 'high';

/** Dimensões que o motor de risco avalia para pontuar um trecho. */
export type RiskFactorType = 'crime' | 'lighting' | 'footTraffic';

/** Par [longitude, latitude] — a ordem que o GeoJSON e o Mapbox esperam. */
export type Coordinate = [longitude: number, latitude: number];

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
  /** Traçado do trecho, do início ao fim. */
  coordinates: Coordinate[];
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
  /** Traçado completo; o primeiro e o último ponto são origem e destino. */
  geometry: Coordinate[];
  segments: RouteSegment[];
}
