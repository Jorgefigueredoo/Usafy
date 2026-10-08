import { useId, type InputHTMLAttributes, type ReactNode } from 'react';

import { layout } from '@/theme';
import { cx } from '@/utils/cx';

import { Icon, type IconName } from './Icon';
import styles from './Input.module.css';

/**
 * - `boxed`: campo com borda própria e rótulo acima (formulários soltos).
 * - `inline`: linha sem borda com o rótulo dentro, para empilhar campos num mesmo cartão.
 */
export type InputVariant = 'boxed' | 'inline';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  variant?: InputVariant;
  icon?: IconName;
  /** Elemento no início do campo, no lugar de `icon` (ex.: marcador de origem). */
  leading?: ReactNode;
  /** Ação no fim do campo (ex.: botão "usar minha localização"). */
  trailing?: ReactNode;
}

export function Input({
  label,
  value,
  onChangeText,
  variant = 'boxed',
  icon,
  leading,
  trailing,
  id,
  ...rest
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const inline = variant === 'inline';

  const labelElement = (
    <label htmlFor={inputId} className={styles.label}>
      {label}
    </label>
  );
  const input = (
    <input
      id={inputId}
      className={styles.input}
      value={value}
      onChange={(event) => onChangeText(event.target.value)}
      autoComplete="off"
      {...rest}
    />
  );

  return (
    <div className={cx(styles.field, inline && styles.inline)}>
      {!inline && labelElement}
      <div className={styles.control}>
        {leading ? (
          <span className={styles.leading}>{leading}</span>
        ) : (
          icon && <Icon name={icon} size={layout.iconMd} className={styles.icon} />
        )}
        {inline ? (
          <div className={styles.stack}>
            {labelElement}
            {input}
          </div>
        ) : (
          input
        )}
        {trailing && <div className={styles.trailing}>{trailing}</div>}
      </div>
    </div>
  );
}
