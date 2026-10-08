import { useSyncExternalStore } from 'react';

import { getSavedPlaces, subscribeSavedPlaces, type SavedPlaces } from '@/services/savedPlaces';

/** Casa, Trabalho e destinos recentes, atualizando todos os componentes que os usam. */
export function useSavedPlaces(): SavedPlaces {
  return useSyncExternalStore(subscribeSavedPlaces, getSavedPlaces);
}
