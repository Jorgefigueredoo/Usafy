import { useEffect, useState } from 'react';

import { Button, Icon, Text } from '@/components/ui';
import type { NavigationProgress } from '@/services/navigation';
import { shareTrip, type ShareResult } from '@/services/shareTrip';
import type { Route } from '@/types';
import { cx } from '@/utils/cx';
import { formatClock, formatDistanceMeters, formatDuration } from '@/utils/format';

import styles from './NavigationPanel.module.css';

export interface NavigationPanelProps {
  route: Route;
  /** `null` enquanto o GPS não deu a primeira leitura. */
  progress: NavigationProgress | null;
  onStop: () => void;
}

const FEEDBACK_MS = 2500;

interface Feedback {
  text: string;
  error: boolean;
}

/** Só copiar e falhar precisam de aviso: no menu do sistema o próprio app confirma o envio. */
const FEEDBACK: Partial<Record<ShareResult, Feedback>> = {
  copied: { text: 'Trajeto copiado: é só colar na conversa.', error: false },
  failed: { text: 'Não foi possível compartilhar agora.', error: true },
};

/** Rodapé do modo navegação: chegada prevista e o que falta, como no Google Maps. */
export function NavigationPanel({ route, progress, onStop }: NavigationPanelProps) {
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    if (!feedback) return;
    const id = window.setTimeout(() => setFeedback(null), FEEDBACK_MS);
    return () => window.clearTimeout(id);
  }, [feedback]);

  const share = async () => {
    // Antes da primeira leitura do GPS, a previsão é a duração da rota a partir de agora.
    const arrival = progress?.arrivalTimestamp ?? Date.now() + route.durationMinutes * 60_000;
    const result = await shareTrip(route, arrival);
    setFeedback(FEEDBACK[result] ?? null);
  };

  return (
    <>
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
        <button
          type="button"
          className={styles.share}
          onClick={() => void share()}
          aria-label="Compartilhar trajeto e horário de chegada"
        >
          <Icon name="share" />
        </button>
        <Button label="Encerrar" variant="secondary" icon="close" onClick={onStop} className={styles.stop} />
      </div>
      {feedback && (
        <p className={cx(styles.feedback, feedback.error && styles.feedbackError)} role="status">
          {feedback.text}
        </p>
      )}
    </>
  );
}
