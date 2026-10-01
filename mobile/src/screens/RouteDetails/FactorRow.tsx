import { StyleSheet, View } from 'react-native';

import { Icon, Text } from '@/components/ui';
import { colors, riskToneColors, spacing } from '@/theme';
import type { RiskFactor } from '@/types';
import { RISK_FACTOR_LABELS } from '@/utils/risk';

export interface FactorRowProps {
  factor: RiskFactor;
}

const ICON_SIZE = 16;

/** Explica um dos fatores que compôs o score do trecho. */
export function FactorRow({ factor }: FactorRowProps) {
  const tone = riskToneColors[factor.severity];

  return (
    <View style={styles.container}>
      <Icon name={factor.type} size={ICON_SIZE} color={tone} />
      <View style={styles.texts}>
        <Text variant="caption" color={tone}>
          {RISK_FACTOR_LABELS[factor.type]}
        </Text>
        <Text variant="body" color={colors.textSecondary}>
          {factor.description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  texts: {
    flex: 1,
    gap: spacing.xs / 2,
  },
});
