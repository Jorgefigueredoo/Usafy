import { Text } from '@/components/ui';

import styles from './NeighborhoodChips.module.css';

export interface NeighborhoodChipsProps {
  neighborhoods: readonly string[];
  onSelect: (neighborhood: string) => void;
  disabled?: boolean;
}

export function NeighborhoodChips({ neighborhoods, onSelect, disabled = false }: NeighborhoodChipsProps) {
  return (
    <div className={styles.wrapper}>
      <Text variant="caption" tone="secondary">
        Bairros do Recife
      </Text>
      <ul className={styles.list}>
        {neighborhoods.map((name) => (
          <li key={name}>
            <button
              type="button"
              className={styles.chip}
              onClick={() => onSelect(name)}
              disabled={disabled}
            >
              {name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
