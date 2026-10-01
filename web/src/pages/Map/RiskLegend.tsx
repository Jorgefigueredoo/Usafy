import type { RiskLevel } from '@/types';
import { cx } from '@/utils/cx';
import { RISK_LABELS } from '@/utils/risk';

import styles from './RiskLegend.module.css';

const LEVELS: RiskLevel[] = ['low', 'medium', 'high'];

export function RiskLegend() {
  return (
    <ul className={styles.legend} aria-label="Legenda de cores do mapa">
      {LEVELS.map((level) => (
        <li key={level} className={styles.item}>
          <span className={cx(styles.swatch, styles[level])} aria-hidden="true" />
          {RISK_LABELS[level]}
        </li>
      ))}
    </ul>
  );
}
