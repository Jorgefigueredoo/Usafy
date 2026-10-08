import { useState } from 'react';

import { Button, Icon, Text } from '@/components/ui';
import type { NavigationTrip } from '@/hooks';
import { layout } from '@/theme';
import type { Route } from '@/types';
import { cx } from '@/utils/cx';
import { formatDistanceKm, formatDuration } from '@/utils/format';
import { RISK_SUMMARY_LABELS } from '@/utils/risk';

import styles from './ArrivalPanel.module.css';

export interface ArrivalPanelProps {
  /** Rota atual (usada se, por algum motivo, a viagem não tiver sido registrada). */
  route: Route;
  trip: NavigationTrip | null;
  onFinish: () => void;
  onNewSearch: () => void;
}

const MS_IN_MINUTE = 60_000;

function highRiskNote(count: number): string {
  if (count === 0) return 'Nenhum trecho de risco alto no caminho.';
  if (count === 1) return 'Você passou por 1 trecho de risco alto.';
  return `Você passou por ${count} trechos de risco alto.`;
}

/** Resumo da viagem: tempo real, distância e o risco do caminho feito. */
export function ArrivalPanel({ route, trip, onFinish, onNewSearch }: ArrivalPanelProps) {
  // O painel monta no momento da chegada: esse é o fim da viagem.
  const [arrivedAt] = useState(() => Date.now());
  const traveled = trip?.route ?? route;
  const elapsedMinutes = trip ? (arrivedAt - trip.startedAt) / MS_IN_MINUTE : traveled.durationMinutes;
  const highRiskCount = traveled.segments.filter((segment) => segment.riskLevel === 'high').length;

  return (
    <>
      <div className={styles.arrival} role="status">
        <span className={styles.icon}>
          <Icon name="check" size={layout.iconLg} strokeWidth={2.4} />
        </span>
        <div className={styles.texts}>
          <Text variant="title" as="strong">
            Você chegou!
          </Text>
          <Text tone="secondary" className={styles.destination}>
            {route.destination}
          </Text>
        </div>
      </div>

      <dl className={styles.stats}>
        <div className={styles.stat}>
          <dt>Tempo</dt>
          <dd>{formatDuration(elapsedMinutes)}</dd>
        </div>
        <div className={styles.stat}>
          <dt>Distância</dt>
          <dd>{formatDistanceKm(traveled.distanceKm)}</dd>
        </div>
        <div className={styles.stat}>
          <dt>Risco do caminho</dt>
          <dd className={cx(styles.risk, styles[traveled.overallRisk])}>
            {RISK_SUMMARY_LABELS[traveled.overallRisk]}
          </dd>
        </div>
      </dl>

      <p className={cx(styles.note, highRiskCount > 0 && styles.noteWarning)}>
        <Icon name={highRiskCount > 0 ? 'alert' : 'check'} size={layout.iconSm} />
        {highRiskNote(highRiskCount)}
      </p>

      <div className={styles.actions}>
        <Button label="Nova rota" variant="secondary" icon="route" onClick={onNewSearch} fullWidth />
        <Button label="Concluir" onClick={onFinish} fullWidth />
      </div>
    </>
  );
}
