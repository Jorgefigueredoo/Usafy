import { Card, Metric, RiskBadge, Text } from '@/components/ui';
import type { Route } from '@/types';
import { formatDistanceKm, formatDuration } from '@/utils/format';
import { RISK_SUMMARY_LABELS } from '@/utils/risk';

import styles from './RouteSummaryCard.module.css';

export interface RouteSummaryCardProps {
  route: Route;
}

export function RouteSummaryCard({ route }: RouteSummaryCardProps) {
  return (
    <Card as="section">
      <div className={styles.header}>
        <div className={styles.path}>
          <Text variant="caption" tone="secondary">
            Trajeto
          </Text>
          <Text variant="subtitle" as="h2">
            {route.origin} → {route.destination}
          </Text>
        </div>
        <RiskBadge level={route.overallRisk} label={RISK_SUMMARY_LABELS[route.overallRisk]} />
      </div>

      <div className={styles.metrics}>
        <Metric icon="clock" value={formatDuration(route.durationMinutes)} label="Tempo estimado" />
        <Metric icon="route" value={formatDistanceKm(route.distanceKm)} label="Distância" />
      </div>
    </Card>
  );
}
