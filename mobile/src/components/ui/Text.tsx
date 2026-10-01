import type { ReactNode } from 'react';
import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';

import { colors, typography, type TypographyToken } from '@/theme';

export interface TextProps extends RNTextProps {
  variant?: TypographyToken;
  color?: string;
  align?: TextStyle['textAlign'];
  children: ReactNode;
}

/** Único ponto onde tamanho/peso de texto são definidos: as telas só escolhem a variante. */
export function Text({
  variant = 'body',
  color = colors.textPrimary,
  align,
  style,
  children,
  ...rest
}: TextProps) {
  return (
    <RNText style={[typography[variant], { color, textAlign: align }, style]} {...rest}>
      {children}
    </RNText>
  );
}
