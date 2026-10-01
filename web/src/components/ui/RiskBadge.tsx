import type { RiskLevel } from '@/types';
import { cx } from '@/utils/cx';
import { RISK_LABELS } from '@/utils/risk';

import styles from './RiskBadge.module.css';

export interface RiskBadgeProps {
  level: RiskLevel;
  /** Sobrescreve o rótulo curto padrão ("Seguro", "Atenção", "Risco alto"). */
  label?: string;
}

export function RiskBadge({ level, label = RISK_LABELS[level] }: RiskBadgeProps) {
  return (
    <span className={cx(styles.badge, styles[level])}>
      <span className={styles.dot} aria-hidden="true" />
      {label}
    </span>
  );
}
