import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { colors, radius, riskFillColors, spacing } from '@/theme';
import type { RiskLevel } from '@/types';
import { RISK_LABELS } from '@/utils/risk';

const LEVELS: RiskLevel[] = ['low', 'medium', 'high'];
const SWATCH_SIZE = 10;

/** Traduz as cores do traçado no mapa. */
export function RiskLegend() {
  return (
    <View style={styles.container}>
      {LEVELS.map((level) => (
        <View key={level} style={styles.item}>
          <View style={[styles.swatch, { backgroundColor: riskFillColors[level] }]} />
          <Text variant="caption" color={colors.textSecondary}>
            {RISK_LABELS[level]}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
  swatch: {
    width: SWATCH_SIZE,
    height: SWATCH_SIZE,
    borderRadius: radius.full,
  },
});
