/** Formatações em pt-BR, centralizadas para que as páginas não repitam regras. */

const METERS_IN_KM = 1000;
const MINUTES_IN_HOUR = 60;

export function formatDistanceMeters(meters: number): string {
  if (meters < METERS_IN_KM) return `${Math.round(meters)} m`;
  return `${toDecimal(meters / METERS_IN_KM)} km`;
}

export function formatDistanceKm(km: number): string {
  return `${toDecimal(km)} km`;
}

export function formatDuration(minutes: number): string {
  if (minutes < MINUTES_IN_HOUR) return `${Math.max(1, Math.round(minutes))} min`;
  const hours = Math.floor(minutes / MINUTES_IN_HOUR);
  const rest = Math.round(minutes % MINUTES_IN_HOUR);
  return rest === 0 ? `${hours} h` : `${hours} h ${String(rest).padStart(2, '0')}`;
}

export function formatScore(score: number): string {
  return String(Math.round(score));
}

function toDecimal(value: number): string {
  return value.toFixed(1).replace('.', ',');
}
