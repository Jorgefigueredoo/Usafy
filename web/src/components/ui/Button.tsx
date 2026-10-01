import type { ButtonHTMLAttributes } from 'react';

import { cx } from '@/utils/cx';

import styles from './Button.module.css';
import { Icon, type IconName } from './Icon';
import { Spinner } from './Spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  label: string;
  variant?: ButtonVariant;
  icon?: IconName;
  /** Ícone depois do texto (ex.: chevron de "avançar"). */
  trailingIcon?: IconName;
  loading?: boolean;
  /** Texto exibido no lugar de `label` enquanto `loading` for verdadeiro. */
  loadingLabel?: string;
  fullWidth?: boolean;
}

export function Button({
  label,
  variant = 'primary',
  icon,
  trailingIcon,
  loading = false,
  loadingLabel,
  fullWidth = false,
  disabled,
  type = 'button',
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cx(
        styles.button,
        styles[variant],
        fullWidth && styles.fullWidth,
        loading && styles.loading,
        className,
      )}
      {...rest}
    >
      {loading ? <Spinner label={loadingLabel ?? label} /> : icon && <Icon name={icon} />}
      <span>{loading && loadingLabel ? loadingLabel : label}</span>
      {!loading && trailingIcon && <Icon name={trailingIcon} />}
    </button>
  );
}
