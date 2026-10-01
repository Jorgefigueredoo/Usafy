import { Icon, type IconName } from './Icon';
import styles from './Metric.module.css';
import { Text } from './Text';

export interface MetricProps {
  icon: IconName;
  value: string;
  label: string;
}

/** Número de destaque com rótulo, ex.: "24 min · Tempo estimado". */
export function Metric({ icon, value, label }: MetricProps) {
  return (
    <div className={styles.metric}>
      <Icon name={icon} className={styles.icon} />
      <div className={styles.texts}>
        <Text variant="subtitle" as="strong">
          {value}
        </Text>
        <Text variant="caption" tone="secondary" as="span">
          {label}
        </Text>
      </div>
    </div>
  );
}
