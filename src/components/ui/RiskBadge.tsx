import { StyleSheet, View } from 'react-native';

import { radius, riskSurfaceColors, riskToneColors, spacing } from '@/theme';
import type { RiskLevel } from '@/types';
import { RISK_LABELS } from '@/utils/risk';

import { Text } from './Text';

export interface RiskBadgeProps {
  level: RiskLevel;
  /** Sobrescreve o rótulo padrão do nível (ex.: "Risco moderado" no resumo). */
  label?: string;
}

export function RiskBadge({ level, label }: RiskBadgeProps) {
  const text = label ?? RISK_LABELS[level];

  return (
    <View style={[styles.badge, { backgroundColor: riskSurfaceColors[level] }]}>
      <View style={[styles.dot, { backgroundColor: riskToneColors[level] }]} />
      <Text variant="caption" color={riskToneColors[level]}>
        {text}
      </Text>
    </View>
  );
}

const DOT_SIZE = 6;

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs + 2,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: radius.full,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: radius.full,
  },
});
