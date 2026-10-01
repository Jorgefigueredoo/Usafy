import type { ReactNode } from 'react';

import { cx } from '@/utils/cx';

import styles from './Card.module.css';

export interface CardProps {
  children: ReactNode;
  /** Padding maior, para cards de destaque. */
  spacious?: boolean;
  as?: 'div' | 'section' | 'article' | 'li';
  className?: string;
}

export function Card({ children, spacious = false, as: Element = 'div', className }: CardProps) {
  return (
    <Element className={cx(styles.card, spacious && styles.spacious, className)}>{children}</Element>
  );
}
