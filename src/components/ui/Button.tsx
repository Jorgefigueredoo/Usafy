import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, spacing } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

interface VariantTokens {
  background: string;
  backgroundPressed: string;
  label: string;
  borderColor: string;
}

const VARIANT_TOKENS: Record<ButtonVariant, VariantTokens> = {
  primary: {
    background: colors.primary,
    backgroundPressed: colors.primaryPressed,
    label: colors.textPrimary,
    borderColor: colors.transparent,
  },
  secondary: {
    background: colors.surface,
    backgroundPressed: colors.surfaceElevated,
    label: colors.textPrimary,
    borderColor: colors.border,
  },
  ghost: {
    background: colors.transparent,
    backgroundPressed: colors.overlay,
    label: colors.textSecondary,
    borderColor: colors.transparent,
  },
};

const DISABLED_OPACITY = 0.45;
const ICON_SIZE = 20;
const MIN_HEIGHT = 52;

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled = false,
  loading = false,
  accessibilityLabel,
  style,
}: ButtonProps) {
  const tokens = VARIANT_TOKENS[variant];
  const isInteractive = !disabled && !loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={!isInteractive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: !isInteractive, busy: loading }}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor:
            pressed && isInteractive ? tokens.backgroundPressed : tokens.background,
          borderColor: tokens.borderColor,
          opacity: disabled ? DISABLED_OPACITY : 1,
        },
        style,
      ]}
    >
      <View style={styles.content}>
        {loading ? <ActivityIndicator size="small" color={tokens.label} /> : null}
        {!loading && icon ? <Icon name={icon} size={ICON_SIZE} color={tokens.label} /> : null}
        <Text variant="subtitle" color={tokens.label}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: MIN_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
});
