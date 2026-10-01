import { Icon, Spinner, type IconName } from '@/components/ui';
import type { PlaceKind, PlaceSuggestion } from '@/services/placeSearch';
import { cx } from '@/utils/cx';

import { optionId } from './suggestionIds';
import styles from './SuggestionList.module.css';

export interface SuggestionListProps {
  id: string;
  query: string;
  suggestions: PlaceSuggestion[];
  activeIndex: number;
  loading: boolean;
  empty: boolean;
  onSelect: (suggestion: PlaceSuggestion) => void;
}

const KIND_ICONS: Record<PlaceKind, IconName> = {
  poi: 'pin',
  address: 'route',
  area: 'locate',
};

/** Destaca a parte do nome que corresponde ao que o usuário digitou. */
function HighlightedName({ name, query }: { name: string; query: string }) {
  const start = name.toLocaleLowerCase('pt-BR').indexOf(query.trim().toLocaleLowerCase('pt-BR'));
  if (!query.trim() || start < 0) return <span className={styles.match}>{name}</span>;

  const end = start + query.trim().length;
  return (
    <>
      {name.slice(0, start)}
      <span className={styles.match}>{name.slice(start, end)}</span>
      {name.slice(end)}
    </>
  );
}

export function SuggestionList({
  id,
  query,
  suggestions,
  activeIndex,
  loading,
  empty,
  onSelect,
}: SuggestionListProps) {
  return (
    <ul id={id} role="listbox" aria-label="Sugestões de lugares" className={styles.list}>
      {suggestions.map((suggestion, index) => (
        <li
          key={suggestion.id}
          id={optionId(id, index)}
          role="option"
          aria-selected={index === activeIndex}
          className={cx(styles.option, index === activeIndex && styles.active)}
          // mousedown (não click): impede o campo de perder o foco e fechar a lista antes da escolha.
          onMouseDown={(event) => {
            event.preventDefault();
            onSelect(suggestion);
          }}
        >
          <Icon name={KIND_ICONS[suggestion.kind]} className={styles.icon} />
          <span className={styles.texts}>
            <span className={styles.name}>
              <HighlightedName name={suggestion.name} query={query} />
            </span>
            {suggestion.description && <span className={styles.description}>{suggestion.description}</span>}
          </span>
        </li>
      ))}

      {loading && suggestions.length === 0 && (
        <li className={styles.status} role="presentation">
          <Spinner label="Buscando lugares" />
          Buscando lugares…
        </li>
      )}
      {empty && (
        <li className={styles.status} role="presentation">
          Nenhum lugar encontrado. Você ainda pode buscar pelo texto digitado.
        </li>
      )}
    </ul>
  );
}
