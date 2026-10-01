import { Card, RiskBadge, RiskBar, Text } from '@/components/ui';
import type { RouteSegment } from '@/types';
import { formatDistanceMeters, formatScore } from '@/utils/format';

import { FactorRow } from './FactorRow';
import styles from './SegmentCard.module.css';

export interface SegmentCardProps {
  segment: RouteSegment;
  /** Posição do trecho no trajeto, começando em 1. */
  position: number;
}

export function SegmentCard({ segment, position }: SegmentCardProps) {
  return (
    <Card as="li">
      <div className={styles.header}>
        <div className={styles.titles}>
          <Text variant="caption" tone="secondary">
            Trecho {position} · {formatDistanceMeters(segment.distanceMeters)}
          </Text>
          <Text variant="subtitle" as="h3">
            {segment.name}
          </Text>
        </div>
        <RiskBadge level={segment.riskLevel} />
      </div>

      <div className={styles.barRow}>
        <div className={styles.bar}>
          <RiskBar
            score={segment.riskScore}
            level={segment.riskLevel}
            label={`Risco do trecho ${position}`}
          />
        </div>
        <Text variant="caption" tone={segment.riskLevel} as="span">
          {formatScore(segment.riskScore)}
        </Text>
      </div>

      <ul className={styles.factors} aria-label="Fatores de risco">
        {segment.factors.map((factor) => (
          <FactorRow key={factor.type} factor={factor} />
        ))}
      </ul>
    </Card>
  );
}
