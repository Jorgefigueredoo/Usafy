import { StyleSheet, View } from 'react-native';

import { Spacer } from '@/components/layout';
import { Card, Metric, RiskBadge, RiskBar, Text } from '@/components/ui';
import { colors, spacing } from '@/theme';
import type { Route } from '@/types';
import { formatDistanceKm, formatDuration, formatScore } from '@/utils/format';
import { RISK_SUMMARY_LABELS } from '@/utils/risk';

export interface OverallScoreCardProps {
  route: Route;
}

const BAR_HEIGHT = 10;

export function OverallScoreCard({ route }: OverallScoreCardProps) {
  return (
    <Card padding="lg">
      <View style={styles.header}>
        <View>
          <Text variant="caption" color={colors.textSecondary}>
            Risco geral da rota
          </Text>
          <View style={styles.scoreRow}>
            <Text variant="display">{formatScore(route.overallScore)}</Text>
            <Text variant="body" color={colors.textSecondary}>
              /100
            </Text>
          </View>
        </View>
        <RiskBadge level={route.overallRisk} label={RISK_SUMMARY_LABELS[route.overallRisk]} />
      </View>

      <Spacer size="md" />
      <RiskBar score={route.overallScore} level={route.overallRisk} height={BAR_HEIGHT} />

      <Spacer size="lg" />
      <View style={styles.metrics}>
        <Metric icon="clock" value={formatDuration(route.durationMinutes)} label="Tempo estimado" />
        <Metric icon="route" value={formatDistanceKm(route.distanceKm)} label="Distância" />
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
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  metrics: {
    flexDirection: 'row',
    gap: spacing.xl,
  },
});
