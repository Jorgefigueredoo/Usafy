import { Icon, Text, type IconName } from '@/components/ui';

import styles from './FeatureRow.module.css';

export interface FeatureRowProps {
  icon: IconName;
  title: string;
  description: string;
}

export function FeatureRow({ icon, title, description }: FeatureRowProps) {
  return (
    <li className={styles.row}>
      <span className={styles.iconWrap}>
        <Icon name={icon} />
      </span>
      <span className={styles.texts}>
        <Text variant="subtitle" as="strong">
          {title}
        </Text>
        <Text tone="secondary" as="span">
          {description}
        </Text>
      </span>
    </li>
  );
}
