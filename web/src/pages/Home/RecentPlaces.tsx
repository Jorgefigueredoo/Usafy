import { Icon, Text } from '@/components/ui';
import { clearRecents, type SavedPlace } from '@/services/savedPlaces';

import styles from './RecentPlaces.module.css';

/** Quantos recentes aparecem na Home (o aparelho guarda alguns a mais). */
const VISIBLE_RECENTS = 3;

export interface RecentPlacesProps {
  recents: SavedPlace[];
  onUse: (place: SavedPlace) => void;
  disabled?: boolean;
}

/** Últimos destinos buscados: um toque refaz o caminho de sempre. */
export function RecentPlaces({ recents, onUse, disabled = false }: RecentPlacesProps) {
  if (recents.length === 0) return null;

  return (
    <section className={styles.section} aria-label="Destinos recentes">
      <div className={styles.header}>
        <Text variant="caption" tone="secondary" className={styles.heading}>
          Recentes
        </Text>
        <button type="button" className={styles.clear} onClick={clearRecents} disabled={disabled}>
          Limpar
        </button>
      </div>
      <ul className={styles.list}>
        {recents.slice(0, VISIBLE_RECENTS).map((place) => (
          <li key={place.text}>
            <button
              type="button"
              className={styles.item}
              onClick={() => onUse(place)}
              disabled={disabled}
            >
              <Icon name="clock" className={styles.icon} />
              <span className={styles.text}>{place.text}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
