import { useEffect, useState, useSyncExternalStore } from 'react';

import type { IconName } from '@/components/ui';
import { SATELLITE_STYLE, STANDARD_STYLE } from '@/services/mapboxConfig';
import { mapPalettes } from '@/theme';

/** Estilo do mapa escolhido pelo usuário. `auto` acompanha a luz do dia no Recife. */
export type MapThemeId = 'auto' | 'day' | 'night' | 'satellite';

/** Iluminação do Mapbox Standard. */
export type LightPreset = 'dawn' | 'day' | 'dusk' | 'night';

export interface MapThemeOption {
  id: MapThemeId;
  label: string;
  description: string;
  icon: IconName;
}

export const MAP_THEMES: readonly MapThemeOption[] = [
  { id: 'auto', label: 'Automático', description: 'Acompanha o horário do dia', icon: 'clock' },
  { id: 'day', label: 'Dia', description: 'Claro, bom sob o sol', icon: 'sun' },
  { id: 'night', label: 'Noite', description: 'Escuro, não ofusca', icon: 'moon' },
  { id: 'satellite', label: 'Satélite', description: 'Imagem real das ruas', icon: 'globe' },
];

const DEFAULT_THEME: MapThemeId = 'auto';
const STORAGE_KEY = 'usafy:map-theme';

function isMapThemeId(value: unknown): value is MapThemeId {
  return MAP_THEMES.some((theme) => theme.id === value);
}

// ---------------------------------------------------------------------------
// Preferência do usuário: fica no aparelho e é compartilhada por todos os mapas abertos.

function readStoredTheme(): MapThemeId {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isMapThemeId(stored) ? stored : DEFAULT_THEME;
  } catch {
    // Navegação privada ou armazenamento bloqueado: segue com o padrão.
    return DEFAULT_THEME;
  }
}

let currentTheme = readStoredTheme();
const listeners = new Set<() => void>();

export function getMapTheme(): MapThemeId {
  return currentTheme;
}

export function setMapTheme(theme: MapThemeId): void {
  currentTheme = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Sem armazenamento a escolha vale só até fechar o app.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useMapTheme(): [MapThemeId, (theme: MapThemeId) => void] {
  return [useSyncExternalStore(subscribe, getMapTheme), setMapTheme];
}

// ---------------------------------------------------------------------------
// Iluminação pelo relógio. Perto da linha do Equador o sol nasce ~5h e se põe ~17h30 o ano
// todo, então horários fixos bastam.

const minutes = (hours: number, mins = 0) => hours * 60 + mins;
const DAWN_START = minutes(5);
const DAY_START = minutes(6);
const DUSK_START = minutes(16, 50);
const NIGHT_START = minutes(17, 50);
const CLOCK_CHECK_MS = 60_000;

export function lightPresetAt(date: Date): LightPreset {
  const now = minutes(date.getHours(), date.getMinutes());
  if (now >= DAWN_START && now < DAY_START) return 'dawn';
  if (now >= DAY_START && now < DUSK_START) return 'day';
  if (now >= DUSK_START && now < NIGHT_START) return 'dusk';
  return 'night';
}

/** Iluminação atual pelo relógio, reavaliada a cada minuto (entregas varam a virada do dia). */
export function useClockLightPreset(): LightPreset {
  const [preset, setPreset] = useState(() => lightPresetAt(new Date()));
  useEffect(() => {
    const id = window.setInterval(() => setPreset(lightPresetAt(new Date())), CLOCK_CHECK_MS);
    return () => window.clearInterval(id);
  }, []);
  return preset;
}

// ---------------------------------------------------------------------------
// Tradução do tema para estilo + configuração do Mapbox.

export interface MapAppearance {
  style: string;
  /** Configuração do fragmento `basemap` (o import principal dos estilos Standard). */
  config: Record<string, unknown>;
}

export function mapAppearance(theme: MapThemeId, clockPreset: LightPreset): MapAppearance {
  const lightPreset: LightPreset =
    theme === 'day' ? 'day' : theme === 'night' ? 'night' : clockPreset;

  if (theme === 'satellite') {
    return { style: SATELLITE_STYLE, config: { lightPreset } };
  }

  return {
    style: STANDARD_STYLE,
    config: {
      lightPreset,
      show3dObjects: true,
      // Menos pontos de interesse: referência suficiente sem poluir a rota.
      densityPointOfInterestLabels: 2,
      ...(lightPreset === 'night' ? mapPalettes.night : mapPalettes.day),
    },
  };
}
