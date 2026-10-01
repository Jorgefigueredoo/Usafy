import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { colors, radius, spacing } from '@/theme';

export interface HeaderProps {
  title: string;
  subtitle?: string;
  /** Quando informado, exibe o botão de voltar à esquerda do título. */
  onBack?: () => void;
}

const BACK_ICON_SIZE = 22;

export function Header({ title, subtitle, onBack }: HeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            hitSlop={spacing.sm}
            style={({ pressed }) => [
              styles.backButton,
              { backgroundColor: pressed ? colors.overlay : colors.transparent },
            ]}
          >
            <Icon name="chevronLeft" size={BACK_ICON_SIZE} color={colors.textPrimary} />
          </Pressable>
        ) : null}
        <Text variant="title" style={styles.title}>
          {title}
        </Text>
      </View>
      {subtitle ? (
        <Text variant="body" color={colors.textSecondary}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  backButton: {
    marginLeft: -spacing.sm,
    padding: spacing.xs,
    borderRadius: radius.full,
  },
  title: {
    flex: 1,
  },
});
