import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, spacing, type SpacingToken } from '@/theme';

export interface CardProps {
  children: ReactNode;
  padding?: SpacingToken;
  style?: StyleProp<ViewStyle>;
}

export function Card({ children, padding = 'md', style }: CardProps) {
  return <View style={[styles.card, { padding: spacing[padding] }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
});
