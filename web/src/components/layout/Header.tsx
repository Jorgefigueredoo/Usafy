import type { ReactNode } from 'react';

import { Icon, Text } from '@/components/ui';
import { cx } from '@/utils/cx';

import styles from './Header.module.css';

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  backLabel?: string;
  trailing?: ReactNode;
  /** Usado sobre o mapa: botão de voltar com fundo próprio. */
  floating?: boolean;
  className?: string;
}

export function Header({
  title,
  subtitle,
  onBack,
  backLabel = 'Voltar',
  trailing,
  floating = false,
  className,
}: HeaderProps) {
  return (
    <header className={cx(styles.header, floating && styles.floating, className)}>
      {onBack && (
        <button type="button" className={styles.back} onClick={onBack} aria-label={backLabel}>
          <Icon name="chevronLeft" />
        </button>
      )}
      {(title || subtitle) && (
        <div className={styles.titles}>
          {subtitle && (
            <Text variant="caption" tone="secondary">
              {subtitle}
            </Text>
          )}
          {title && (
            <Text variant="title" as="h1">
              {title}
            </Text>
          )}
        </div>
      )}
      {trailing && <div className={styles.trailing}>{trailing}</div>}
    </header>
  );
}
