import { Pressable, StyleSheet, View } from 'react-native';

import { Spacer } from '@/components/layout';
import { Card, Icon, RiskBadge, RiskBar, Text } from '@/components/ui';
import { colors, layout, riskToneColors, spacing } from '@/theme';
import type { RouteSegment } from '@/types';
import { formatDistanceMeters, formatScore } from '@/utils/format';

import { FactorRow } from './FactorRow';

export interface SegmentCardProps {
  segment: RouteSegment;
  /** Posição do trecho no trajeto, começando em 1. */
  position: number;
  onShowOnMap: () => void;
}

export function SegmentCard({ segment, position, onShowOnMap }: SegmentCardProps) {
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

      {/* Leva ao mapa com este trecho em destaque (mesmo efeito da faixa de risco). */}
      <Pressable
        onPress={onShowOnMap}
        accessibilityRole="button"
        accessibilityLabel={`Ver o trecho ${position} no mapa`}
        style={({ pressed }) => [styles.showOnMap, pressed && styles.showOnMapPressed]}
      >
        <Icon name="pin" size={layout.iconSm} color={colors.accent} />
        <Text color={colors.accent} style={styles.showOnMapText}>
          Ver no mapa
        </Text>
        <Icon name="chevronRight" size={layout.iconSm} color={colors.accent} />
      </Pressable>
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
  showOnMap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: layout.touchTarget - spacing.sm,
    marginTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  showOnMapPressed: {
    opacity: 0.7,
  },
  showOnMapText: {
    flex: 1,
    fontWeight: '600',
  },
});
