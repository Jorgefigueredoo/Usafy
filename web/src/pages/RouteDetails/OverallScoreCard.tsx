import { Card, Metric, RiskBadge, RiskBar, Text } from '@/components/ui';
import type { Route } from '@/types';
import { formatDistanceKm, formatDuration, formatScore } from '@/utils/format';
import { RISK_SUMMARY_LABELS } from '@/utils/risk';

import styles from './OverallScoreCard.module.css';

export interface OverallScoreCardProps {
  route: Route;
}

export function OverallScoreCard({ route }: OverallScoreCardProps) {
  return (
    <Card as="section" spacious>
      <Text variant="caption" tone="secondary">
        Score geral de risco
      </Text>

      <div className={styles.top}>
        <div className={styles.score}>
          <Text variant="display" tone={route.overallRisk} as="strong">
            {formatScore(route.overallScore)}
          </Text>
          <Text tone="secondary" as="span">
            / 100
          </Text>
        </div>
        <RiskBadge level={route.overallRisk} label={RISK_SUMMARY_LABELS[route.overallRisk]} />
      </div>

      <div className={styles.bar}>
        <RiskBar score={route.overallScore} level={route.overallRisk} label="Risco geral da rota" />
      </div>

      <div className={styles.metrics}>
        <Metric icon="clock" value={formatDuration(route.durationMinutes)} label="Tempo estimado" />
        <Metric icon="route" value={formatDistanceKm(route.distanceKm)} label="Distância" />
      </div>
    </Card>
  );
}
