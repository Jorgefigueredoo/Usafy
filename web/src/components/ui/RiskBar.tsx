import type { CSSProperties } from 'react';

import type { RiskLevel } from '@/types';
import { cx } from '@/utils/cx';

import styles from './RiskBar.module.css';

export interface RiskBarProps {
  /** Score de 0 a 100; valores fora da faixa são limitados. */
  score: number;
  level: RiskLevel;
  /** Nome acessível, ex.: "Risco do trecho Av. Boa Viagem". */
  label?: string;
}

const MAX_SCORE = 100;

export function RiskBar({ score, level, label = 'Nível de risco' }: RiskBarProps) {
  const clamped = Math.min(Math.max(score, 0), MAX_SCORE);
  // Valor de dado (não de theme): repassado ao CSS como custom property.
  const fillStyle = { '--risk-bar-value': `${clamped}%` } as CSSProperties;

  return (
    <div
      className={styles.track}
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={MAX_SCORE}
      aria-valuenow={Math.round(clamped)}
    >
      <div className={cx(styles.fill, styles[level])} style={fillStyle} />
    </div>
  );
}
