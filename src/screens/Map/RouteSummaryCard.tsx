import { StyleSheet, View } from 'react-native';

import { Spacer } from '@/components/layout';
import { Card, Metric, RiskBadge, Text } from '@/components/ui';
import { colors, spacing } from '@/theme';
import type { Route } from '@/types';
import { formatDistanceKm, formatDuration } from '@/utils/format';
import { RISK_SUMMARY_LABELS } from '@/utils/risk';

export interface RouteSummaryCardProps {
  route: Route;
}

export function RouteSummaryCard({ route }: RouteSummaryCardProps) {
  return (
    <Card>
      <View style={styles.header}>
        <View style={styles.path}>
          <Text variant="caption" color={colors.textSecondary}>
            Trajeto
          </Text>
          <Text variant="subtitle" numberOfLines={2}>
            {route.origin} → {route.destination}
          </Text>
        </View>
        <RiskBadge level={route.overallRisk} label={RISK_SUMMARY_LABELS[route.overallRisk]} />
      </View>

      <Spacer size="md" />

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
  path: {
    flex: 1,
    gap: spacing.xs / 2,
  },
  metrics: {
    flexDirection: 'row',
    gap: spacing.xl,
  },
});
