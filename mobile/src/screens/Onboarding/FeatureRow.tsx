import { StyleSheet, View } from 'react-native';

import { Icon, Text, type IconName } from '@/components/ui';
import { colors, radius, spacing } from '@/theme';

export interface FeatureRowProps {
  icon: IconName;
  title: string;
  description: string;
}

const ICON_SIZE = 22;
const BADGE_SIZE = 44;

export function FeatureRow({ icon, title, description }: FeatureRowProps) {
  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Icon name={icon} size={ICON_SIZE} color={colors.accent} />
      </View>
      <View style={styles.texts}>
        <Text variant="subtitle">{title}</Text>
        <Text variant="body" color={colors.textSecondary}>
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
  },
  badge: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  texts: {
    flex: 1,
    gap: spacing.xs / 2,
  },
});
