import { Button, Icon, Text } from '@/components/ui';

import styles from './ArrivalPanel.module.css';

export interface ArrivalPanelProps {
  destination: string;
  onFinish: () => void;
}

export function ArrivalPanel({ destination, onFinish }: ArrivalPanelProps) {
  return (
    <>
      <div className={styles.arrival} role="status">
        <span className={styles.icon}>
          <Icon name="flag" />
        </span>
        <div className={styles.texts}>
          <Text variant="subtitle" as="strong">
            Você chegou!
          </Text>
          <Text tone="secondary">{destination}</Text>
        </div>
      </div>
      <Button label="Concluir" fullWidth onClick={onFinish} />
    </>
  );
}
