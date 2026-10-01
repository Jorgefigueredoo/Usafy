import { useId, type InputHTMLAttributes } from 'react';

import { layout } from '@/theme';

import { Icon, type IconName } from './Icon';
import styles from './Input.module.css';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  icon?: IconName;
}

export function Input({ label, value, onChangeText, icon, id, ...rest }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className={styles.field}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      <div className={styles.control}>
        {icon && <Icon name={icon} size={layout.iconMd} className={styles.icon} />}
        <input
          id={inputId}
          className={styles.input}
          value={value}
          onChange={(event) => onChangeText(event.target.value)}
          autoComplete="off"
          {...rest}
        />
      </div>
    </div>
  );
}
