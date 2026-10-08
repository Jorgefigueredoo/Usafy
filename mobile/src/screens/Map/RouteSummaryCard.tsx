import { StyleSheet, View } from 'react-native';

import { Card, Icon, RiskBadge, Text } from '@/components/ui';
import { colors, layout, spacing } from '@/theme';
import type { Route } from '@/types';
import { formatDistanceKm, formatDuration } from '@/utils/format';
import { RISK_SUMMARY_LABELS } from '@/utils/risk';

import { RiskStrip } from './RiskStrip';

export interface RouteSummaryCardProps {
  route: Route;
  selectedSegmentId: string | null;
  onSelectSegment: (segmentId: string | null) => void;
}

export function RouteSummaryCard({ route, selectedSegmentId, onSelectSegment }: RouteSummaryCardProps) {
  return (
    <Card>
      <View style={styles.header}>
        <View style={styles.path}>
          {/* Nomes longos (endereços completos) ficam em até duas linhas. */}
          <Text variant="subtitle" numberOfLines={2} accessibilityRole="header">
            {route.origin} → {route.destination}
          </Text>
          <View style={styles.metrics}>
            <View style={styles.metric}>
              <Icon name="clock" size={layout.iconSm} color={colors.textSecondary} />
              <Text style={styles.metricValue}>{formatDuration(route.durationMinutes)}</Text>
            </View>
            <View style={styles.metric}>
              <Icon name="route" size={layout.iconSm} color={colors.textSecondary} />
              <Text style={styles.metricValue}>{formatDistanceKm(route.distanceKm)}</Text>
            </View>
          </View>
        </View>
        <RiskBadge level={route.overallRisk} label={RISK_SUMMARY_LABELS[route.overallRisk]} />
      </View>

      <View style={styles.strip}>
        <RiskStrip segments={route.segments} selectedSegmentId={selectedSegmentId} onSelectSegment={onSelectSegment} />
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
    gap: spacing.xs,
  },
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metricValue: {
    fontWeight: '600',
  },
  strip: {
    marginTop: spacing.sm,
  },
});
