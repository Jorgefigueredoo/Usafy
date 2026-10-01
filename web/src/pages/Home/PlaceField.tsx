import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';

import { Input, type IconName } from '@/components/ui';
import { usePlaceSuggestions } from '@/hooks';
import type { PlaceSuggestion } from '@/services/placeSearch';
import type { Coordinate } from '@/types';

import styles from './PlaceField.module.css';
import type { PlaceValue } from './placeValue';
import { optionId } from './suggestionIds';
import { SuggestionList } from './SuggestionList';

export interface PlaceFieldProps {
  label: string;
  icon: IconName;
  placeholder: string;
  value: PlaceValue;
  onChange: (value: PlaceValue) => void;
  /** Usada para priorizar lugares próximos nas sugestões. */
  near: Coordinate | null;
  /** Avisado quando a lista de sugestões abre ou fecha. */
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  readOnly?: boolean;
  /** Texto exibido no lugar de `value.text` (ex.: "Minha localização"). */
  displayText?: string;
  trailing?: ReactNode;
  enterKeyHint?: 'next' | 'go';
}

export function PlaceField({
  label,
  icon,
  placeholder,
  value,
  onChange,
  near,
  onOpenChange,
  disabled = false,
  readOnly = false,
  displayText,
  trailing,
  enterKeyHint,
}: PlaceFieldProps) {
  const listId = useId();
  const [open, setOpenState] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  /** Cada escolha ganha um número; se o usuário digitar de novo, a resposta antiga é ignorada. */
  const choiceRef = useRef(0);
  const fieldRef = useRef<HTMLDivElement>(null);

  const searchable = open && !readOnly && !disabled;
  const { suggestions, loading, empty, select } = usePlaceSuggestions(value.text, searchable, near);
  const expanded = searchable && (suggestions.length > 0 || loading || empty);

  // Quando a lista aparece, sobe o campo para o topo: no celular, o teclado esconderia as
  // sugestões logo abaixo dele.
  const suggestionCount = suggestions.length;
  useEffect(() => {
    if (expanded) fieldRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }, [expanded, suggestionCount]);

  const setOpen = (next: boolean) => {
    setOpenState(next);
    setActiveIndex(-1);
    onOpenChange?.(next);
  };

  const handleType = (text: string) => {
    choiceRef.current += 1;
    onChange({ text, coordinate: null });
    setOpen(true);
  };

  const choose = async (suggestion: PlaceSuggestion) => {
    const choice = ++choiceRef.current;
    setOpen(false);
    // Mostra o nome na hora; a coordenada chega logo depois. Se não vier, a busca usa o texto.
    onChange({ text: suggestion.name, coordinate: null });
    const place = await select(suggestion);
    if (place && choice === choiceRef.current) onChange({ text: place.label, coordinate: place.coordinate });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!expanded) return;
    const last = suggestions.length - 1;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (index >= last ? 0 : index + 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? last : index - 1));
    } else if (event.key === 'Enter' && suggestions[activeIndex]) {
      // Enter escolhe a sugestão destacada em vez de enviar o formulário.
      event.preventDefault();
      void choose(suggestions[activeIndex]);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={fieldRef} className={styles.field}>
      <Input
        label={label}
        icon={icon}
        placeholder={placeholder}
        value={displayText ?? value.text}
        onChangeText={handleType}
        onKeyDown={handleKeyDown}
        // Ao voltar para um texto digitado (sem lugar escolhido), reabre as sugestões dele.
        onFocus={() => {
          if (value.text && !value.coordinate) setOpen(true);
        }}
        onBlur={() => setOpen(false)}
        disabled={disabled}
        readOnly={readOnly}
        enterKeyHint={enterKeyHint}
        trailing={trailing}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={expanded}
        aria-controls={expanded ? listId : undefined}
        aria-activedescendant={expanded && activeIndex >= 0 ? optionId(listId, activeIndex) : undefined}
      />
      {expanded && (
        <SuggestionList
          id={listId}
          query={value.text}
          suggestions={suggestions}
          activeIndex={activeIndex}
          loading={loading}
          empty={empty}
          onSelect={(suggestion) => void choose(suggestion)}
        />
      )}
    </div>
  );
}
