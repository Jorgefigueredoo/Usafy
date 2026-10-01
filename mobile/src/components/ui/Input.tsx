import { useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export interface InputProps extends Omit<TextInputProps, 'style' | 'placeholderTextColor'> {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  icon?: IconName;
  error?: string;
}

const ICON_SIZE = 20;
const MIN_HEIGHT = 52;

export function Input({ label, value, onChangeText, icon, error, ...rest }: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = error ? colors.danger : isFocused ? colors.primary : colors.border;

  return (
    <View style={styles.container}>
      <Text variant="caption" color={colors.textSecondary}>
        {label}
      </Text>

      <View style={[styles.field, { borderColor }]}>
        {icon ? (
          <Icon
            name={icon}
            size={ICON_SIZE}
            color={isFocused ? colors.accent : colors.textSecondary}
          />
        ) : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={styles.input}
          placeholderTextColor={colors.textSecondary}
          accessibilityLabel={label}
          {...rest}
        />
      </View>

      {error ? (
        <Text variant="caption" color={colors.danger}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs + 2,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: MIN_HEIGHT,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
});
