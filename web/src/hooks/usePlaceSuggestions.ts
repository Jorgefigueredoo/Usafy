import { useCallback, useEffect, useRef, useState } from 'react';

import {
  createSearchSession,
  retrievePlace,
  suggestPlaces,
  type PlaceSuggestion,
  type ResolvedPlace,
} from '@/services/placeSearch';
import type { Coordinate } from '@/types';

const MIN_QUERY_LENGTH = 3;
/** Espera o usuário parar de digitar antes de chamar a API. */
const DEBOUNCE_MS = 250;

export interface PlaceSuggestionsState {
  suggestions: PlaceSuggestion[];
  /** Há uma busca em andamento para o texto atual. */
  loading: boolean;
  /** A busca do texto atual terminou sem resultados. */
  empty: boolean;
  /** Busca a coordenada do lugar escolhido e encerra a sessão de busca. */
  select: (suggestion: PlaceSuggestion) => Promise<ResolvedPlace | null>;
}

interface SearchResult {
  query: string;
  suggestions: PlaceSuggestion[];
}

export function usePlaceSuggestions(
  query: string,
  enabled: boolean,
  near: Coordinate | null,
): PlaceSuggestionsState {
  const [result, setResult] = useState<SearchResult>({ query: '', suggestions: [] });
  const sessionRef = useRef<string | null>(null);
  // Posição só influencia a ordem; guardada em ref para o GPS (1×/s) não disparar novas buscas.
  const nearRef = useRef(near);

  useEffect(() => {
    nearRef.current = near;
  }, [near]);

  const trimmed = query.trim();
  const active = enabled && trimmed.length >= MIN_QUERY_LENGTH;

  useEffect(() => {
    if (!active) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      sessionRef.current ??= createSearchSession();
      try {
        const suggestions = await suggestPlaces(trimmed, sessionRef.current, nearRef.current, controller.signal);
        setResult({ query: trimmed, suggestions });
      } catch {
        // Abortada (nova tecla) ou sem rede: sem sugestões, o texto digitado ainda funciona na busca.
        if (!controller.signal.aborted) setResult({ query: trimmed, suggestions: [] });
      }
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [active, trimmed]);

  const select = useCallback(async (suggestion: PlaceSuggestion) => {
    const session = sessionRef.current ?? createSearchSession();
    sessionRef.current = null;
    try {
      return await retrievePlace(suggestion, session);
    } catch {
      return null;
    }
  }, []);

  const settled = result.query === trimmed;
  return {
    // Enquanto a nova busca não volta, mantém a lista anterior (evita a lista "piscar" a cada tecla).
    suggestions: active ? result.suggestions : [],
    loading: active && !settled,
    empty: active && settled && result.suggestions.length === 0,
    select,
  };
}
