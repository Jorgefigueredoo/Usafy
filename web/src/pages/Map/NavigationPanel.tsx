import { Button, Text } from '@/components/ui';
import type { NavigationProgress } from '@/services/navigation';
import { formatClock, formatDistanceMeters, formatDuration } from '@/utils/format';

import styles from './NavigationPanel.module.css';

export interface NavigationPanelProps {
  /** `null` enquanto o GPS não deu a primeira leitura. */
  progress: NavigationProgress | null;
  onStop: () => void;
}

/** Rodapé do modo navegação: chegada prevista e o que falta, como no Google Maps. */
export function NavigationPanel({ progress, onStop }: NavigationPanelProps) {
  return (
    <div className={styles.row}>
      <div className={styles.eta}>
        {progress ? (
          <>
            <Text variant="title" tone="low" as="strong">
              {formatDuration(progress.remainingMinutes)}
            </Text>
            <span className={styles.details}>
              <Text variant="caption" tone="secondary" as="span">
                {formatDistanceMeters(progress.remainingMeters)}
              </Text>
              <Text variant="caption" tone="secondary" as="span">
                · Chegada {formatClock(progress.arrivalTimestamp)}
              </Text>
            </span>
          </>
        ) : (
          <Text tone="secondary">Localizando você…</Text>
        )}
      </div>
      <Button label="Encerrar" variant="secondary" icon="close" onClick={onStop} className={styles.stop} />
    </div>
  );
}
