import type { ReactNode } from 'react';

import type { TypographyToken } from '@/theme';
import type { RiskLevel } from '@/types';
import { cx } from '@/utils/cx';

import styles from './Text.module.css';

export type TextTone = 'primary' | 'secondary' | 'accent' | 'danger' | RiskLevel;

export interface TextProps {
  variant?: TypographyToken;
  tone?: TextTone;
  align?: 'start' | 'center' | 'end';
  /** Elemento HTML renderizado; o visual vem sempre de `variant`. */
  as?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'strong';
  className?: string;
  children: ReactNode;
}

export function Text({
  variant = 'body',
  tone = 'primary',
  align = 'start',
  as: Element = 'p',
  className,
  children,
}: TextProps) {
  return (
    <Element
      className={cx(
        styles.text,
        styles[variant],
        styles[`tone-${tone}`],
        styles[`align-${align}`],
        className,
      )}
    >
      {children}
    </Element>
  );
}
