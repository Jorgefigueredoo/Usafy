import { StyleSheet, View } from 'react-native';

import { Icon, Text, type IconName } from '@/components/ui';
import { colors, radius, spacing } from '@/theme';

export interface FeatureRowProps {
  icon: IconName;
  title: string;
  description: string;
  /** Linha fina acima, separando dos critérios anteriores no mesmo cartão. */
  divided?: boolean;
}

const BADGE_SIZE = spacing.xl + spacing.sm;

export function FeatureRow({ icon, title, description, divided = false }: FeatureRowProps) {
  return (
    <View style={[styles.container, divided && styles.divided]}>
      <View style={styles.badge}>
        <Icon name={icon} color={colors.accent} />
      </View>
      <View style={styles.texts}>
        <Text variant="body" style={styles.title}>
          {title}
        </Text>
        <Text variant="caption" color={colors.textSecondary}>
          {description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  divided: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  badge: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  texts: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
  },
});
