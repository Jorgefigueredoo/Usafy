import type { Route } from '@/types';
import { formatClock } from '@/utils/format';
import { RISK_SUMMARY_LABELS } from '@/utils/risk';

export type ShareResult = 'shared' | 'copied' | 'cancelled' | 'failed';

/** Link do destino que abre em qualquer celular (app de mapas ou navegador). */
function destinationLink(route: Route): string | null {
  const end = route.geometry[route.geometry.length - 1];
  if (!end) return null;
  const [longitude, latitude] = end;
  return `https://www.google.com/maps/search/?api=1&query=${latitude.toFixed(6)},${longitude.toFixed(6)}`;
}

export function tripMessage(route: Route, arrivalTimestamp: number): string {
  const lines = [
    `Estou indo para ${route.destination} pelo Usafy.`,
    `Chegada prevista às ${formatClock(arrivalTimestamp)} (${RISK_SUMMARY_LABELS[route.overallRisk].toLocaleLowerCase('pt-BR')} no caminho).`,
  ];
  const link = destinationLink(route);
  if (link) lines.push(`Destino: ${link}`);
  return lines.join('\n');
}

/**
 * Compartilha destino e horário de chegada: no celular abre o menu do sistema (WhatsApp, SMS…);
 * onde não houver, copia o texto para o usuário colar.
 */
export async function shareTrip(route: Route, arrivalTimestamp: number): Promise<ShareResult> {
  const text = tripMessage(route, arrivalTimestamp);

  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ title: 'Meu trajeto no Usafy', text });
      return 'shared';
    } catch (error) {
      // Fechar o menu sem escolher um app não é erro.
      if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled';
    }
  }

  try {
    await navigator.clipboard.writeText(text);
    return 'copied';
  } catch {
    return 'failed';
  }
}
