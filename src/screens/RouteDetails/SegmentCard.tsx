import { StyleSheet, View } from 'react-native';

import { Spacer } from '@/components/layout';
import { Card, RiskBadge, RiskBar, Text } from '@/components/ui';
import { colors, riskToneColors, spacing } from '@/theme';
import type { RouteSegment } from '@/types';
import { formatDistanceMeters, formatScore } from '@/utils/format';

import { FactorRow } from './FactorRow';

export interface SegmentCardProps {
  segment: RouteSegment;
  /** Posição do trecho no trajeto, começando em 1. */
  position: number;
}

export function SegmentCard({ segment, position }: SegmentCardProps) {
  return (
    <Card>
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <Text variant="caption" color={colors.textSecondary}>
            Trecho {position} · {formatDistanceMeters(segment.distanceMeters)}
          </Text>
          <Text variant="subtitle">{segment.name}</Text>
        </View>
        <RiskBadge level={segment.riskLevel} />
      </View>

      <Spacer size="md" />

      <View style={styles.barRow}>
        <View style={styles.bar}>
          <RiskBar score={segment.riskScore} level={segment.riskLevel} />
        </View>
        <Text variant="caption" color={riskToneColors[segment.riskLevel]}>
          {formatScore(segment.riskScore)}
        </Text>
      </View>

      <Spacer size="md" />

      <View style={styles.factors}>
        {segment.factors.map((factor) => (
          <FactorRow key={factor.type} factor={factor} />
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  titleBlock: {
    flex: 1,
    gap: spacing.xs / 2,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  bar: {
    flex: 1,
  },
  factors: {
    gap: spacing.sm,
  },
});
