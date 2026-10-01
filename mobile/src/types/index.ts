/** Níveis de risco usados em toda a aplicação. */
export type RiskLevel = 'low' | 'medium' | 'high';

/** Dimensões que o motor de risco avalia para pontuar um trecho. */
export type RiskFactorType = 'crime' | 'lighting' | 'footTraffic';

export interface RiskFactor {
  type: RiskFactorType;
  severity: RiskLevel;
  description: string;
}

/** Par [longitude, latitude] — a ordem que o GeoJSON e o Mapbox esperam. */
export type Coordinate = [longitude: number, latitude: number];

export interface RouteSegment {
  id: string;
  name: string;
  riskLevel: RiskLevel;
  /** 0 = totalmente seguro, 100 = risco máximo. */
  riskScore: number;
  distanceMeters: number;
  /** Traçado do trecho no mapa, do início ao fim. */
  coordinates: Coordinate[];
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
  originCoordinate: Coordinate;
  destinationCoordinate: Coordinate;
}
