import { Icon, Text } from '@/components/ui';
import { layout } from '@/theme';

import styles from './NeighborhoodChips.module.css';

export interface NeighborhoodChipsProps {
  neighborhoods: readonly string[];
  onSelect: (neighborhood: string) => void;
  disabled?: boolean;
}

/** Atalhos de bairro numa fileira que rola para o lado (não empurra o botão para baixo). */
export function NeighborhoodChips({ neighborhoods, onSelect, disabled = false }: NeighborhoodChipsProps) {
  return (
    <section className={styles.wrapper} aria-label="Bairros populares">
      <Text variant="caption" tone="secondary" className={styles.heading}>
        Bairros populares
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
              <Icon name="pin" size={layout.iconSm} className={styles.icon} />
              {name}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
