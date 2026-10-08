import { Card, Icon, RiskBadge, Text } from '@/components/ui';
import { layout } from '@/theme';
import type { Route } from '@/types';
import { formatDistanceKm, formatDuration } from '@/utils/format';
import { RISK_SUMMARY_LABELS } from '@/utils/risk';

import { RiskStrip } from './RiskStrip';
import styles from './RouteSummaryCard.module.css';

export interface RouteSummaryCardProps {
  route: Route;
  selectedSegmentId: string | null;
  onSelectSegment: (segmentId: string | null) => void;
}

export function RouteSummaryCard({ route, selectedSegmentId, onSelectSegment }: RouteSummaryCardProps) {
  return (
    <Card as="section">
      <div className={styles.header}>
        <div className={styles.path}>
          <Text variant="subtitle" as="h2" className={styles.title}>
            {route.origin} → {route.destination}
          </Text>
          <span className={styles.metrics}>
            <span className={styles.metric}>
              <Icon name="clock" size={layout.iconSm} />
              {formatDuration(route.durationMinutes)}
            </span>
            <span className={styles.metric}>
              <Icon name="route" size={layout.iconSm} />
              {formatDistanceKm(route.distanceKm)}
            </span>
          </span>
        </div>
        <RiskBadge level={route.overallRisk} label={RISK_SUMMARY_LABELS[route.overallRisk]} />
      </div>

      <div className={styles.strip}>
        <RiskStrip
          segments={route.segments}
          selectedSegmentId={selectedSegmentId}
          onSelectSegment={onSelectSegment}
        />
      </div>
    </Card>
  );
}
