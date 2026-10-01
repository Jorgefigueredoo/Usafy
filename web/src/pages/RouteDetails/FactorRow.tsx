import { Icon, Text } from '@/components/ui';
import { layout } from '@/theme';
import type { RiskFactor } from '@/types';
import { cx } from '@/utils/cx';
import { RISK_FACTOR_LABELS, RISK_LABELS } from '@/utils/risk';

import styles from './FactorRow.module.css';

export interface FactorRowProps {
  factor: RiskFactor;
}

export function FactorRow({ factor }: FactorRowProps) {
  return (
    <li className={styles.row}>
      <span className={cx(styles.icon, styles[factor.severity])}>
        <Icon name={factor.type} size={layout.iconSm} />
      </span>
      <span className={styles.texts}>
        <Text variant="caption" tone={factor.severity} as="strong">
          {RISK_FACTOR_LABELS[factor.type]} · {RISK_LABELS[factor.severity]}
        </Text>
        <Text tone="secondary" as="span">
          {factor.description}
        </Text>
      </span>
    </li>
  );
}
