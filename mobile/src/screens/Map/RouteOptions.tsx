import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { colors, radius, riskToneColors, spacing } from '@/theme';
import type { Route } from '@/types';
import { formatDuration } from '@/utils/format';
import { RISK_SUMMARY_LABELS } from '@/utils/risk';
import { ROUTE_TAG_LABELS, routeTag, sortBySafety } from '@/utils/routeOptions';

export interface RouteOptionsProps {
  options: Route[];
  selectedId: string;
  onSelect: (routeId: string) => void;
}

/**
 * Comparação lado a lado das opções de caminho: o que cada uma ganha (segurança ou tempo).
 * A mais segura vem primeiro e já chega escolhida.
 */
export function RouteOptions({ options, selectedId, onSelect }: RouteOptionsProps) {
  return (
    <View style={styles.options} accessibilityRole="radiogroup" accessibilityLabel="Opções de rota">
      {sortBySafety(options).map((option) => {
        const selected = option.id === selectedId;
        const tag = routeTag(option, options);
        const safe = tag === 'safest' || tag === 'best';
        return (
          <Pressable
            key={option.id}
            onPress={() => onSelect(option.id)}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            accessibilityLabel={`${ROUTE_TAG_LABELS[tag]}: ${formatDuration(option.durationMinutes)}, ${RISK_SUMMARY_LABELS[option.overallRisk]}`}
            style={[styles.option, selected && styles.optionSelected]}
          >
            <Text variant="caption" color={safe ? riskToneColors.low : colors.textSecondary} numberOfLines={1}>
              {ROUTE_TAG_LABELS[tag]}
            </Text>
            <Text variant="subtitle" style={styles.duration}>
              {formatDuration(option.durationMinutes)}
            </Text>
            <View style={styles.risk}>
              <View style={[styles.dot, { backgroundColor: riskToneColors[option.overallRisk] }]} />
              <Text variant="caption" color={riskToneColors[option.overallRisk]} numberOfLines={1}>
                {RISK_SUMMARY_LABELS[option.overallRisk]}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  options: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  option: {
    flex: 1,
    gap: 1,
    paddingVertical: spacing.sm,
    paddingLeft: spacing.sm,
    paddingRight: spacing.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSunken,
  },
  optionSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  duration: {
    fontWeight: '700',
  },
  risk: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: spacing.sm,
    height: spacing.sm,
    borderRadius: radius.full,
  },
});
