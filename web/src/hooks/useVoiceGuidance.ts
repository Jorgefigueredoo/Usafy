import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';

import type { NavigationProgress } from '@/services/navigation';
import {
  isVoiceSupported,
  lowerFirst,
  speak,
  spokenDistance,
  spokenDuration,
  stopSpeaking,
} from '@/services/voice';
import type { Route } from '@/types';

import type { NavigationPhase } from './useNavigation';

/** Aviso antecipado da manobra ("Em 300 metros, vire...") e aviso na hora ("Vire..."). */
const MANEUVER_EARLY_METERS = 400;
const MANEUVER_NOW_METERS = 80;
/** Abaixo disso o aviso antecipado já não faz sentido: fica só o "na hora". */
const MANEUVER_EARLY_MIN_METERS = 150;
/** Antecedência do alerta de trecho de risco alto. */
const RISK_WARNING_METERS = 250;

// ---------------------------------------------------------------------------
// Preferência de voz ligada/desligada, guardada no aparelho.

const STORAGE_KEY = 'usafy:voice-enabled';
const listeners = new Set<() => void>();

function readVoiceEnabled(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== 'false';
  } catch {
    return true;
  }
}

let voiceEnabled = readVoiceEnabled();

function setVoiceEnabled(enabled: boolean): void {
  voiceEnabled = enabled;
  if (!enabled) stopSpeaking();
  try {
    localStorage.setItem(STORAGE_KEY, String(enabled));
  } catch {
    // Sem armazenamento a escolha vale até fechar o app.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getVoiceEnabled = () => voiceEnabled;

// ---------------------------------------------------------------------------

/** Nome de rua que vale a pena falar ("Trecho 3" é rótulo do app, não da rua). */
function streetName(name: string): string | null {
  return /^Trecho \d+$/.test(name) ? null : name;
}

/** Distância (m do Directions) do início da rota até o começo de cada trecho. */
function segmentStarts(route: Route): number[] {
  let total = 0;
  return route.segments.map((segment) => {
    const start = total;
    total += segment.distanceMeters;
    return start;
  });
}

export interface VoiceGuidanceOptions {
  route: Route;
  active: boolean;
  phase: NavigationPhase;
  progress: NavigationProgress | null;
}

export interface VoiceGuidance {
  supported: boolean;
  enabled: boolean;
  toggle: () => void;
  /** Chamar no toque de "Iniciar navegação": no iOS a primeira fala precisa de um gesto. */
  announceStart: () => void;
}

/**
 * Instruções faladas durante a navegação: manobras, alerta de trecho de risco alto à frente,
 * recálculo e chegada. Cada aviso é dito uma vez só por rota.
 */
export function useVoiceGuidance({ route, active, phase, progress }: VoiceGuidanceOptions): VoiceGuidance {
  const supported = isVoiceSupported();
  const enabled = useSyncExternalStore(subscribe, getVoiceEnabled) && supported;
  const spokenRef = useRef(new Set<string>());
  const previousPhaseRef = useRef<NavigationPhase | null>(null);

  const say = useCallback(
    (key: string, text: string, interrupt = false) => {
      if (spokenRef.current.has(key)) return;
      spokenRef.current.add(key);
      if (enabled) speak(text, { interrupt });
    },
    [enabled],
  );

  // Nova navegação ou rota recalculada: os avisos valem de novo.
  useEffect(() => {
    spokenRef.current.clear();
  }, [route.id, active]);

  // Encerrou a navegação ou saiu da tela: para de falar na hora.
  useEffect(() => {
    if (!active) stopSpeaking();
    return () => stopSpeaking();
  }, [active]);

  // Recalculando / chegada: avisos ligados à mudança de fase.
  useEffect(() => {
    const previous = previousPhaseRef.current;
    previousPhaseRef.current = active ? phase : null;
    if (!active || previous === phase) return;
    if (phase === 'rerouting') say(`reroute:${Date.now()}`, 'Recalculando rota.', true);
    if (phase === 'arrived') say('arrived', 'Você chegou ao destino.', true);
  }, [active, phase, say]);

  // Manobras e trechos de risco, a cada leitura do GPS.
  useEffect(() => {
    if (!active || !progress || progress.arrived) return;

    const maneuver = progress.nextManeuver;
    if (maneuver && maneuver.direction !== 'arrive' && maneuver.instruction) {
      const key = `maneuver:${maneuver.distanceFromStartMeters}`;
      const meters = progress.metersToNextManeuver;
      if (meters <= MANEUVER_NOW_METERS) {
        say(`${key}:now`, maneuver.instruction, true);
      } else if (meters <= MANEUVER_EARLY_METERS && meters >= MANEUVER_EARLY_MIN_METERS) {
        say(`${key}:early`, `Em ${spokenDistance(meters)}, ${lowerFirst(maneuver.instruction)}`);
      }
    }

    // Já começou dentro de um trecho de risco alto.
    const current = route.segments[progress.segmentIndex];
    if (current?.riskLevel === 'high') {
      say(`risk:${current.id}`, 'Atenção: você está num trecho de risco alto.');
    }

    // Próximo trecho de risco alto chegando.
    const next = route.segments[progress.segmentIndex + 1];
    const nextStart = segmentStarts(route)[progress.segmentIndex + 1];
    if (next?.riskLevel === 'high' && nextStart !== undefined) {
      const distance = nextStart - progress.traveledMeters;
      if (distance <= RISK_WARNING_METERS) {
        const street = streetName(next.name);
        say(
          `risk:${next.id}`,
          street
            ? `Atenção: trecho de risco alto à frente. ${street}.`
            : 'Atenção: trecho de risco alto à frente.',
        );
      }
    }
  }, [active, progress, route, say]);

  const toggle = useCallback(() => setVoiceEnabled(!voiceEnabled), []);

  const announceStart = useCallback(() => {
    if (!enabled) return;
    speak(
      `Navegação iniciada. Chegada em ${spokenDuration(route.durationMinutes)}.`,
      { interrupt: true },
    );
  }, [enabled, route.durationMinutes]);

  return { supported, enabled, toggle, announceStart };
}
